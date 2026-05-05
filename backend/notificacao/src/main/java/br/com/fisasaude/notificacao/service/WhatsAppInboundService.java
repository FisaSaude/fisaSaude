package br.com.fisasaude.notificacao.service;

import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import br.com.fisasaude.notificacao.integration.agendamento.AgendamentoIntegracaoCliente;
import br.com.fisasaude.notificacao.integration.twilio.TwilioWhatsappSender;
import br.com.fisasaude.notificacao.model.entity.Agendamento;
import br.com.fisasaude.notificacao.model.entity.Cliente;
import br.com.fisasaude.notificacao.model.entity.MensagemRespostaWhatsapp;
import br.com.fisasaude.notificacao.model.enums.RespostaWhatsappTipoEnum;
import br.com.fisasaude.notificacao.model.enums.StatusAgendamentoEnum;
import br.com.fisasaude.notificacao.repository.AgendamentoRepository;
import br.com.fisasaude.notificacao.repository.ClienteRepository;
import br.com.fisasaude.notificacao.repository.MensagemRespostaWhatsappRepository;
import br.com.fisasaude.notificacao.repository.NotificacaoRepository;
import br.com.fisasaude.notificacao.service.support.RespostaWhatsappCorrelacao;
import br.com.fisasaude.notificacao.service.support.RespostaWhatsappTexto;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WhatsAppInboundService {

    private static final Logger log = LoggerFactory.getLogger(WhatsAppInboundService.class);
    private static final DateTimeFormatter HORA_PT = DateTimeFormatter.ofPattern("HH:mm");

    private final ClienteRepository clienteRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final MensagemRespostaWhatsappRepository mensagemRepository;
    private final NotificacaoDispatchService dispatchService;
    private final AgendamentoIntegracaoCliente agendamentoIntegracaoCliente;
    private final TwilioWhatsappSender twilioWhatsappSender;
    private final NotificacaoAppProperties props;

    public WhatsAppInboundService(
            ClienteRepository clienteRepository,
            AgendamentoRepository agendamentoRepository,
            NotificacaoRepository notificacaoRepository,
            MensagemRespostaWhatsappRepository mensagemRepository,
            NotificacaoDispatchService dispatchService,
            AgendamentoIntegracaoCliente agendamentoIntegracaoCliente,
            TwilioWhatsappSender twilioWhatsappSender,
            NotificacaoAppProperties props) {
        this.clienteRepository = clienteRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.notificacaoRepository = notificacaoRepository;
        this.mensagemRepository = mensagemRepository;
        this.dispatchService = dispatchService;
        this.agendamentoIntegracaoCliente = agendamentoIntegracaoCliente;
        this.twilioWhatsappSender = twilioWhatsappSender;
        this.props = props;
    }

    /**
     * @param buttonPayload valor Twilio ({@code ButtonPayload}) quando quick reply/interactive
     * @param buttonText texto visível ({@code ButtonText}); só log/auditoria
     * @param originalRepliedMessageSid {@code OriginalRepliedMessageSid} (resposta citando mensagem outbound)
     */
    @Transactional
    public void processarEntradaPaciente(
            String fromBruto,
            String waId,
            String body,
            String messageSid,
            String buttonPayload,
            String buttonText,
            String originalRepliedMessageSid) {
        if (messageSid != null && mensagemRepository.existsByTwilioMessageSid(messageSid)) {
            log.info("[INBOUND] Ignorado — MessageSid ja processado ({})", messageSid);
            return;
        }

        ZoneId zona = ZoneId.of(props.getTimezone());

        String telefoneOrigem = (waId != null && !waId.isBlank()) ? waId : fromBruto;
        String digitosOrigem = apenasDigitos(telefoneOrigem);
        log.info(
                "[INBOUND] From='{}' WaId='{}' digitosNorm='{}' MessageSid={}",
                fromBruto,
                waId,
                digitosOrigem,
                messageSid);
        log.debug(
                "[INBOUND] Body='{}' ButtonPayload='{}' ButtonText='{}' OriginalRepliedMessageSid='{}'",
                body,
                buttonPayload,
                buttonText,
                originalRepliedMessageSid);

        Optional<Cliente> opCliente = encontrarClientePorTelefoneDigitosIguais(digitosOrigem);
        if (opCliente.isEmpty()) {
            log.warn("[INBOUND] Cliente nao cadastrado digitosNorm={}", digitosOrigem);
            return;
        }
        Cliente cliente = opCliente.get();
        log.info("[INBOUND] Cliente id={} nome='{}'", cliente.getId(), cliente.getNome());

        Optional<RespostaWhatsappCorrelacao.Resultado> correl = resolverComPrioridadeTextoSimples(
                cliente, buttonPayload, body, originalRepliedMessageSid);
        if (correl.isEmpty()) {
            log.warn(
                    "[INBOUND] Nao correlacionado — sem CONFIRMAR_x/CANCELAR_x, SIM id/NAO id, nem OriginalRepliedMessageSid registrado. clienteId={} body='{}' payload='{}'",
                    cliente.getId(),
                    body,
                    buttonPayload);
            return;
        }

        RespostaWhatsappCorrelacao.Resultado c = correl.get();
        log.info(
                "[INBOUND] Correlacao agendamentoId={} tipoResposta={} modo={}",
                c.agendamentoId(),
                c.tipo(),
                c.origem());

        Agendamento agenda =
                agendamentoRepository.findByIdWithRelations(c.agendamentoId()).orElse(null);
        if (agenda == null) {
            log.warn("[INBOUND] Agendamento id={} nao encontrado (correlacao).", c.agendamentoId());
            return;
        }
        if (!agenda.getCliente().getId().equals(cliente.getId())) {
            log.warn(
                    "[INBOUND] Agendamento id={} nao pertence ao remetente: clientePaciente={} clienteAgenda={}",
                    c.agendamentoId(),
                    cliente.getId(),
                    agenda.getCliente().getId());
            return;
        }
        log.info(
                "[INBOUND] Agendamento encontrado id={} status={} data={} hora={}",
                agenda.getId(),
                agenda.getStatus(),
                agenda.getData(),
                agenda.getHoraInicio());

        RespostaWhatsappTipoEnum tipoClassificado = c.tipo();

        MensagemRespostaWhatsapp mr = new MensagemRespostaWhatsapp();
        mr.setAgendamento(agendamentoRepository.getReferenceById(agenda.getId()));
        mr.setCliente(clienteRepository.getReferenceById(cliente.getId()));
        mr.setTelefone(digitosOrigem);
        mr.setConteudoResposta(RespostaWhatsappTexto.conteudoParaPersistencia(montarConteudoAuditoria(buttonPayload, buttonText, body)));
        mr.setRespostaTipo(tipoClassificado);
        mr.setTwilioMessageSid(messageSid);
        LocalDateTime agora = LocalDateTime.now(zona);
        mr.setDataRecebida(agora);
        mr.setCriadoEm(agora);
        mensagemRepository.save(mr);

        if (tipoClassificado == RespostaWhatsappTipoEnum.SIM || tipoClassificado == RespostaWhatsappTipoEnum.NAO) {
            try {
                agendamentoIntegracaoCliente.notificarRespostaWhatsapp(agenda.getId(), tipoClassificado);
                log.info(
                        "[INBOUND] Atualizacao de status delegada ao agendamento — agendamentoId={} tipo={}",
                        agenda.getId(),
                        tipoClassificado);
            } catch (Exception ex) {
                log.warn(
                        "[INBOUND] Falha ao integrar resposta com agendamento id={} tipo={} erro={}",
                        agenda.getId(),
                        tipoClassificado,
                        ex.toString());
            }
            enviarRespostaAutomaticaPaciente(telefoneOrigem, tipoClassificado, agenda.getId());
        } else {
            log.debug(
                    "[INBOUND] Tipo {} nao atualiza status no dominio agendamento.",
                    tipoClassificado);
        }

        if (tipoClassificado == RespostaWhatsappTipoEnum.NAO || tipoClassificado == RespostaWhatsappTipoEnum.REAGENDAR) {
            dispatchService.enviarAvisoRecepcaoPacienteNegativo(
                    agenda.getId(),
                    cliente.getNome(),
                    agenda.getData(),
                    agenda.getHoraInicio().format(HORA_PT),
                    telefoneOrigem);
        }
    }

    private static String montarConteudoAuditoria(String buttonPayload, String buttonText, String body) {
        StringBuilder sb = new StringBuilder();
        if (buttonPayload != null && !buttonPayload.isBlank()) {
            sb.append("[ButtonPayload] ").append(buttonPayload.trim()).append('\n');
        }
        if (buttonText != null && !buttonText.isBlank()) {
            sb.append("[ButtonText] ").append(buttonText.trim()).append('\n');
        }
        if (body != null && !body.isBlank()) {
            sb.append(body.trim());
        }
        return sb.toString().trim();
    }

    private Optional<Cliente> encontrarClientePorTelefoneDigitosIguais(String digitos) {
        if (digitos == null || digitos.isBlank()) {
            return Optional.empty();
        }
        for (Cliente c : clienteRepository.findAll()) {
            String cadastro = apenasDigitos(c.getTelefone());
            if (digitos.equals(cadastro)) {
                return Optional.of(c);
            }
            if (!cadastro.isBlank() && (digitos.endsWith(cadastro) || cadastro.endsWith(digitos))) {
                return Optional.of(c);
            }
        }
        return Optional.empty();
    }

    private static String apenasDigitos(String s) {
        if (s == null) {
            return "";
        }
        String limpo = s.replace("whatsapp:", "").replace("WhatsApp:", "").trim();
        return limpo.replaceAll("\\D+", "");
    }

    private Optional<RespostaWhatsappCorrelacao.Resultado> resolverComPrioridadeTextoSimples(
            Cliente cliente, String buttonPayload, String body, String originalRepliedMessageSid) {
        RespostaWhatsappTipoEnum tipoLivre = RespostaWhatsappTexto.classificarRespostaPaciente(body);
        if ((tipoLivre == RespostaWhatsappTipoEnum.SIM || tipoLivre == RespostaWhatsappTipoEnum.NAO)
                && !RespostaWhatsappCorrelacao.contemIdNoTexto(body)) {
            List<Agendamento> agendados =
                    agendamentoRepository.findByClienteAndStatusOrderByMaisRecente(
                            cliente.getId(), StatusAgendamentoEnum.AGENDADO);
            if (!agendados.isEmpty()) {
                Agendamento escolhido = agendados.get(0);
                log.info(
                        "[INBOUND] Agendamento auto-selecionado para clienteId={} -> agendamentoId={} data={} hora={} status={}",
                        cliente.getId(),
                        escolhido.getId(),
                        escolhido.getData(),
                        escolhido.getHoraInicio(),
                        escolhido.getStatus());
                return Optional.of(
                        new RespostaWhatsappCorrelacao.Resultado(
                                escolhido.getId(),
                                tipoLivre,
                                RespostaWhatsappCorrelacao.OrigemCorrelacao.BODY_SIM_NAO_SIMPLES,
                                RespostaWhatsappTexto.conteudoParaPersistencia(body)));
            }
            log.warn(
                    "[INBOUND] Sem agendamento AGENDADO para auto-selecao clienteId={} texto='{}'",
                    cliente.getId(),
                    body);
        }
        return RespostaWhatsappCorrelacao.resolver(
                buttonPayload, body, originalRepliedMessageSid, notificacaoRepository);
    }

    private void enviarRespostaAutomaticaPaciente(
            String telefoneOrigem, RespostaWhatsappTipoEnum tipo, Integer agendamentoId) {
        String msg =
                tipo == RespostaWhatsappTipoEnum.SIM
                        ? "✅ Agendamento confirmado com sucesso! Te esperamos 👍\n\nProtocolo: AG" + agendamentoId
                        : "❌ Agendamento cancelado. A recepção foi avisada.\n\nProtocolo: AG" + agendamentoId;
        try {
            twilioWhatsappSender.enviarTextoParaWhatsapp(telefoneOrigem, msg);
        } catch (Exception e) {
            log.warn("[INBOUND] Falha ao enviar resposta automatica ao paciente: {}", e.toString());
        }
    }

    @Transactional
    public void registrarCallbackStatusParaLogOpcional(String sid, String messageStatusRaw) {
        log.info("[Twilio webhook status] MessageSid={} MessageStatus={}", sid, messageStatusRaw);
        if (sid == null || sid.isBlank()) {
            return;
        }
    }
}
