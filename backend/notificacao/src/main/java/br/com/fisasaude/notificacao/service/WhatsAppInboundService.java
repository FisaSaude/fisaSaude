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
import java.util.ArrayList;
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

        Optional<RespostaWhatsappCorrelacao.Resultado> correlExplicito =
                RespostaWhatsappCorrelacao.resolver(
                        buttonPayload, body, originalRepliedMessageSid, notificacaoRepository);

        Cliente cliente;
        RespostaWhatsappCorrelacao.Resultado c;

        if (correlExplicito.isPresent() && correlacaoExplicitaComAgendamentoId(buttonPayload, body)) {
            c = correlExplicito.get();
            Agendamento agendaExplicito =
                    agendamentoRepository.findByIdWithRelations(c.agendamentoId()).orElse(null);
            if (agendaExplicito == null) {
                log.warn("[INBOUND] Agendamento id={} nao encontrado (correlacao explicita).", c.agendamentoId());
                return;
            }
            if (!telefoneCompativelComCliente(digitosOrigem, agendaExplicito.getCliente())) {
                log.warn(
                        "[INBOUND] Telefone nao confere com cliente do agendamento id={} digitosNorm={}",
                        c.agendamentoId(),
                        digitosOrigem);
                return;
            }
            cliente = agendaExplicito.getCliente();
            log.info(
                    "[INBOUND] Correlacao explicita agendamentoId={} tipoResposta={} modo={} clienteId={}",
                    c.agendamentoId(),
                    c.tipo(),
                    c.origem(),
                    cliente.getId());
        } else {
            List<Cliente> clientesComMesmoTelefone = encontrarClientesPorTelefoneDigitos(digitosOrigem);
            if (clientesComMesmoTelefone.isEmpty()) {
                log.warn("[INBOUND] Cliente nao cadastrado digitosNorm={}", digitosOrigem);
                return;
            }
            if (clientesComMesmoTelefone.size() > 1) {
                log.info(
                        "[INBOUND] {} clientes com o mesmo telefone digitosNorm={} — correlacao por agendamento mais recente",
                        clientesComMesmoTelefone.size(),
                        digitosOrigem);
            }
            Optional<RespostaWhatsappCorrelacao.Resultado> correl =
                    resolverComPrioridadeTextoSimples(
                            clientesComMesmoTelefone, buttonPayload, body, originalRepliedMessageSid);
            if (correl.isEmpty()) {
                log.warn(
                        "[INBOUND] Nao correlacionado — sem CONFIRMAR_x/CANCELAR_x, SIM id/NAO id, nem OriginalRepliedMessageSid registrado. body='{}' payload='{}'",
                        body,
                        buttonPayload);
                return;
            }
            c = correl.get();
            Agendamento agendaCorrelacionado =
                    agendamentoRepository.findByIdWithRelations(c.agendamentoId()).orElse(null);
            if (agendaCorrelacionado == null) {
                log.warn("[INBOUND] Agendamento id={} nao encontrado (correlacao).", c.agendamentoId());
                return;
            }
            cliente = agendaCorrelacionado.getCliente();
            if (!telefoneCompativelComCliente(digitosOrigem, cliente)) {
                log.warn(
                        "[INBOUND] Telefone nao confere com cliente do agendamento id={} digitosNorm={}",
                        c.agendamentoId(),
                        digitosOrigem);
                return;
            }
            log.info(
                    "[INBOUND] Correlacao agendamentoId={} tipoResposta={} modo={} clienteId={}",
                    c.agendamentoId(),
                    c.tipo(),
                    c.origem(),
                    cliente.getId());
        }

        Agendamento agenda =
                agendamentoRepository.findByIdWithRelations(c.agendamentoId()).orElse(null);
        if (agenda == null) {
            log.warn("[INBOUND] Agendamento id={} nao encontrado (correlacao).", c.agendamentoId());
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
            boolean statusAplicadoNoAgendamento =
                    agendamentoIntegracaoCliente.notificarRespostaWhatsapp(agenda.getId(), tipoClassificado);
            if (statusAplicadoNoAgendamento) {
                log.info(
                        "[INBOUND] Status atualizado no agendamento (8080) — agendamentoId={} tipo={}",
                        agenda.getId(),
                        tipoClassificado);
                enviarRespostaAutomaticaPaciente(telefoneOrigem, tipoClassificado, agenda.getId());
            } else {
                log.error(
                        "[INBOUND] Resposta registrada mas agendamento (8080) indisponivel ou recusou — agendamentoId={} tipo={}. "
                                + "Verifique se o servico 8080 esta no ar e se X-Internal-Token coincide (dev123).",
                        agenda.getId(),
                        tipoClassificado);
                enviarRespostaFalhaIntegracaoAgendamento(telefoneOrigem, agenda.getId());
            }
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

    private static boolean correlacaoExplicitaComAgendamentoId(String buttonPayload, String body) {
        String payload = buttonPayload != null ? buttonPayload.trim() : "";
        String texto = body != null ? body.trim().replaceAll("\\s+", " ") : "";
        if (RespostaWhatsappCorrelacao.contemIdNoTexto(texto)) {
            return true;
        }
        return payload.matches("(?is)^\\s*CONFIRMAR[_\\s-]?\\d+\\s*$")
                || payload.matches("(?is)^\\s*CANCELAR[_\\s-]?\\d+\\s*$");
    }

    private static boolean telefoneCompativelComCliente(String digitosOrigem, Cliente cliente) {
        if (digitosOrigem == null || digitosOrigem.isBlank() || cliente == null) {
            return false;
        }
        String cadastro = apenasDigitos(cliente.getTelefone());
        if (digitosOrigem.equals(cadastro)) {
            return true;
        }
        return !cadastro.isBlank() && (digitosOrigem.endsWith(cadastro) || cadastro.endsWith(digitosOrigem));
    }

    private List<Cliente> encontrarClientesPorTelefoneDigitos(String digitos) {
        if (digitos == null || digitos.isBlank()) {
            return List.of();
        }
        List<Cliente> encontrados = new ArrayList<>();
        for (Cliente c : clienteRepository.findAll()) {
            if (telefoneCompativelComCliente(digitos, c)) {
                encontrados.add(c);
            }
        }
        return encontrados;
    }

    private static String apenasDigitos(String s) {
        if (s == null) {
            return "";
        }
        String limpo = s.replace("whatsapp:", "").replace("WhatsApp:", "").trim();
        return limpo.replaceAll("\\D+", "");
    }

    private Optional<RespostaWhatsappCorrelacao.Resultado> resolverComPrioridadeTextoSimples(
            List<Cliente> clientes, String buttonPayload, String body, String originalRepliedMessageSid) {
        RespostaWhatsappTipoEnum tipoLivre = RespostaWhatsappTexto.classificarRespostaPaciente(body);
        if ((tipoLivre == RespostaWhatsappTipoEnum.SIM || tipoLivre == RespostaWhatsappTipoEnum.NAO)
                && !RespostaWhatsappCorrelacao.contemIdNoTexto(body)) {
            List<Integer> clienteIds = clientes.stream().map(Cliente::getId).toList();
            List<Agendamento> agendados =
                    agendamentoRepository.findByClienteIdInAndStatusOrderByMaisRecente(
                            clienteIds, StatusAgendamentoEnum.AGENDADO);
            if (!agendados.isEmpty()) {
                Agendamento escolhido = agendados.get(0);
                log.info(
                        "[INBOUND] Agendamento auto-selecionado entre {} cliente(s) -> agendamentoId={} clienteId={} data={} hora={}",
                        clientes.size(),
                        escolhido.getId(),
                        escolhido.getCliente().getId(),
                        escolhido.getData(),
                        escolhido.getHoraInicio());
                return Optional.of(
                        new RespostaWhatsappCorrelacao.Resultado(
                                escolhido.getId(),
                                tipoLivre,
                                RespostaWhatsappCorrelacao.OrigemCorrelacao.BODY_SIM_NAO_SIMPLES,
                                RespostaWhatsappTexto.conteudoParaPersistencia(body)));
            }
            log.warn(
                    "[INBOUND] Sem agendamento AGENDADO para auto-selecao entre clienteIds={} texto='{}'",
                    clienteIds,
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

    private void enviarRespostaFalhaIntegracaoAgendamento(String telefoneOrigem, Integer agendamentoId) {
        String msg =
                "⚠️ Recebemos sua resposta (AG"
                        + agendamentoId
                        + "), mas não foi possível confirmar no sistema agora.\n"
                        + "A recepção foi alertada. Você também pode ligar para confirmar.";
        try {
            twilioWhatsappSender.enviarTextoParaWhatsapp(telefoneOrigem, msg);
        } catch (Exception e) {
            log.warn("[INBOUND] Falha ao enviar aviso de integracao ao paciente: {}", e.toString());
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
