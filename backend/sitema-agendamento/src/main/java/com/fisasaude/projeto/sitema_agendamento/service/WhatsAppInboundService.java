package com.fisasaude.projeto.sitema_agendamento.service;

import com.fisasaude.projeto.sitema_agendamento.config.NotificacaoAppProperties;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Agendamento;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Cliente;
import com.fisasaude.projeto.sitema_agendamento.model.entity.MensagemRespostaWhatsapp;
import com.fisasaude.projeto.sitema_agendamento.model.enums.RespostaWhatsappTipoEnum;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusAgendamentoEnum;
import com.fisasaude.projeto.sitema_agendamento.repository.AgendamentoRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.ClienteRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.MensagemRespostaWhatsappRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
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
    private final MensagemRespostaWhatsappRepository mensagemRepository;
    private final NotificacaoDispatchService dispatchService;
    private final NotificacaoAppProperties props;

    public WhatsAppInboundService(
            ClienteRepository clienteRepository,
            AgendamentoRepository agendamentoRepository,
            MensagemRespostaWhatsappRepository mensagemRepository,
            NotificacaoDispatchService dispatchService,
            NotificacaoAppProperties props
    ) {
        this.clienteRepository = clienteRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.mensagemRepository = mensagemRepository;
        this.dispatchService = dispatchService;
        this.props = props;
    }

    /** Idempotente por MessageSid. Heuristica simples SIM/NAO em texto normalizado ASCII. */
    @Transactional
    public void processarEntradaPaciente(String fromBruto, String body, String messageSid) {
        if (messageSid != null && mensagemRepository.existsByTwilioMessageSid(messageSid)) {
            log.info("Inbound ignorado duplicate MessageSid={}", messageSid);
            return;
        }

        ZoneId zona = ZoneId.of(props.getTimezone());

        String digitosOrigem = apenasDigitos(fromBruto);
        Optional<Cliente> opCliente = encontrarClientePorTelefoneDigitosIguais(digitosOrigem);
        if (opCliente.isEmpty()) {
            log.warn("Inbound Whats sem cliente cadastrado para numero normalizado {}", digitosOrigem);
            return;
        }
        Cliente cliente = opCliente.get();

        LocalDate janela = LocalDate.now(zona).minusDays(14);
        List<Agendamento> candidatos =
                agendamentoRepository.findByClienteFuturoOuHojeMesmoEstado(
                        cliente.getId(),
                        StatusAgendamentoEnum.AGENDADO,
                        janela
                );
        if (candidatos.isEmpty()) {
            log.warn("Paciente clienteId={} respondeu mas nenhum AGENDADO encontrado na janela.", cliente.getId());
            return;
        }
        Agendamento agenda = candidatos.getFirst();

        RespostaWhatsappTipoEnum tipo = classificarTipoResposta(normalizeText(body));

        MensagemRespostaWhatsapp mr = new MensagemRespostaWhatsapp();
        mr.setAgendamento(agendamentoRepository.getReferenceById(agenda.getId()));
        mr.setCliente(clienteRepository.getReferenceById(cliente.getId()));
        mr.setTelefone(digitosOrigem);
        mr.setConteudoResposta(body == null ? "" : body.trim());
        mr.setRespostaTipo(tipo);
        mr.setTwilioMessageSid(messageSid);
        LocalDateTime agora = LocalDateTime.now(zona);
        mr.setDataRecebida(agora);
        mr.setCriadoEm(agora);
        mensagemRepository.save(mr);

        log.info("Resposta whatsapp agendamento={} cliente={} tipo={} sid={}", agenda.getId(), cliente.getId(), tipo,
                messageSid);

        if (tipo == RespostaWhatsappTipoEnum.NAO || tipo == RespostaWhatsappTipoEnum.REAGENDAR) {
            dispatchService.enviarAvisoRecepcaoPacienteNegativo(
                    agenda.getId(),
                    cliente.getId(),
                    cliente.getNome(),
                    agenda.getData(),
                    agenda.getHoraInicio().format(HORA_PT),
                    fromBruto
            );
        }
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

    private static RespostaWhatsappTipoEnum classificarTipoResposta(String t) {
        if (t == null || t.isBlank()) {
            return RespostaWhatsappTipoEnum.OUTRO;
        }
        if (t.contains("SIM") || t.contains("CONFIRM") || t.contains("CORRETO") || "OK".equals(t)) {
            return RespostaWhatsappTipoEnum.SIM;
        }
        if (t.contains("REMARC")) {
            return RespostaWhatsappTipoEnum.REAGENDAR;
        }
        if (t.contains("NAO")) {
            return RespostaWhatsappTipoEnum.NAO;
        }
        return RespostaWhatsappTipoEnum.OUTRO;
    }

    private static String apenasDigitos(String s) {
        if (s == null) {
            return "";
        }
        String limpo =
                s.replace("whatsapp:", "")
                        .replace("WhatsApp:", "")
                        .trim();
        return limpo.replaceAll("\\D+", "");
    }

    private static String normalizeText(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        String upper = raw.trim().toUpperCase(Locale.ROOT);
        return Normalizer.normalize(upper, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
    }

    @Transactional
    public void registrarCallbackStatusParaLogOpcional(String sid, String messageStatusRaw) {
        log.info("[Twilio webhook status] MessageSid={} MessageStatus={}", sid, messageStatusRaw);
        if (sid == null || sid.isBlank()) {
            return;
        }
    }
}
