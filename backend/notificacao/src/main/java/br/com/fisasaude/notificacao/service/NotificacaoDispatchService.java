package br.com.fisasaude.notificacao.service;

import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import br.com.fisasaude.notificacao.integration.twilio.TwilioWhatsappSender;
import br.com.fisasaude.notificacao.model.entity.Agendamento;
import br.com.fisasaude.notificacao.model.entity.Cliente;
import br.com.fisasaude.notificacao.model.entity.Notificacao;
import br.com.fisasaude.notificacao.model.enums.StatusAgendamentoEnum;
import br.com.fisasaude.notificacao.model.enums.StatusNotificacaoEnum;
import br.com.fisasaude.notificacao.model.enums.TipoNotificacaoEnum;
import br.com.fisasaude.notificacao.repository.AgendamentoRepository;
import br.com.fisasaude.notificacao.repository.NotificacaoRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificacaoDispatchService {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoDispatchService.class);
    private static final ObjectMapper OM = new ObjectMapper();
    private static final DateTimeFormatter FMT_PT = DateTimeFormatter.ofPattern("dd/MM/uuuu");
    private static final DateTimeFormatter HORA_PT = DateTimeFormatter.ofPattern("HH:mm");

    private final AgendamentoRepository agendamentoRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final TwilioWhatsappSender twilioWhatsappSender;
    private final NotificacaoAppProperties props;

    public NotificacaoDispatchService(
            AgendamentoRepository agendamentoRepository,
            NotificacaoRepository notificacaoRepository,
            TwilioWhatsappSender twilioWhatsappSender,
            NotificacaoAppProperties props) {
        this.agendamentoRepository = agendamentoRepository;
        this.notificacaoRepository = notificacaoRepository;
        this.twilioWhatsappSender = twilioWhatsappSender;
        this.props = props;
    }

    public ZoneId zona() {
        return ZoneId.of(props.getTimezone());
    }

    public boolean existeNotificacaoAtivaMesmoTipo(Integer agendamentoId, TipoNotificacaoEnum tipo) {
        return notificacaoRepository.existsByAgendamento_IdAndTipoAndStatusNot(
                agendamentoId, tipo, StatusNotificacaoEnum.DESCARTADA);
    }

    /** Chamado via API interna pelo serviço de agendamento — precisa da própria transação. */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void descartarConfirmacaoElembreteParaAgendamento(Integer agendamentoId) {
        marcarTipoDescarte(agendamentoId, TipoNotificacaoEnum.CONFIRMACAO);
        marcarTipoDescarte(agendamentoId, TipoNotificacaoEnum.LEMBRETE);
    }

    private void marcarTipoDescarte(Integer agendamentoId, TipoNotificacaoEnum tipo) {
        List<Notificacao> lista =
                notificacaoRepository.findByAgendamento_IdAndTipoAndStatusNotIn(
                        agendamentoId, tipo, List.of(StatusNotificacaoEnum.DESCARTADA));
        if (lista.isEmpty()) {
            return;
        }
        for (Notificacao n : lista) {
            n.setStatus(StatusNotificacaoEnum.DESCARTADA);
            n.setProximaRetentativa(null);
        }
        notificacaoRepository.saveAll(lista);
    }

    /** Mantém pendências de lembrete — descarta apenas notificações de confirmação (SIM via WhatsApp). */
    @Transactional(propagation = Propagation.REQUIRED)
    public void descartarSomenteConfirmacaoParaAgendamento(Integer agendamentoId) {
        marcarTipoDescarte(agendamentoId, TipoNotificacaoEnum.CONFIRMACAO);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void solicitadoConfirmacaoAposSalvar(Integer agendamentoId) {
        Agendamento aBase = carregarOuLog(agendamentoId);
        if (aBase == null) {
            return;
        }
        if (aBase.getStatus() != StatusAgendamentoEnum.AGENDADO) {
            return;
        }
        Cliente cliente = aBase.getCliente();
        if (!Boolean.TRUE.equals(cliente.getWhatsappAtivo())) {
            log.info("Skipping confirmacao agendamento={} cliente sem whatsapp ativo", agendamentoId);
            return;
        }
        if (existeNotificacaoAtivaMesmoTipo(agendamentoId, TipoNotificacaoEnum.CONFIRMACAO)) {
            log.debug("Ja existe CONFIRMACAO ativa para agendamento {}", agendamentoId);
            return;
        }
        LocalDateTime now = LocalDateTime.now(zona());

        Notificacao n = new Notificacao();
        n.setTipo(TipoNotificacaoEnum.CONFIRMACAO);
        n.setStatus(StatusNotificacaoEnum.PENDENTE);
        n.setTentativas(0);
        n.setMensagem(buildMensagemConfirmacao(aBase));
        n.setAgendamento(agendamentoRepository.getReferenceById(aBase.getId()));
        n.setCriadoEm(now);
        n = notificacaoRepository.save(n);

        tentarEnviar(n.getId(), false);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void garantirSomenteUmLembreteParaData(LocalDate dataAtendimentoAgendamentos) {
        List<Agendamento> fila =
                agendamentoRepository.findAgendamentosParaLembreteStatusEm(
                        dataAtendimentoAgendamentos,
                        List.of(StatusAgendamentoEnum.AGENDADO, StatusAgendamentoEnum.CONFIRMADO));
        for (Agendamento stub : fila) {
            Agendamento a = agendamentoRepository.findByIdWithRelations(stub.getId()).orElse(null);
            if (a == null
                    || (a.getStatus() != StatusAgendamentoEnum.AGENDADO
                            && a.getStatus() != StatusAgendamentoEnum.CONFIRMADO)) {
                continue;
            }
            if (!Boolean.TRUE.equals(a.getCliente().getWhatsappAtivo())) {
                continue;
            }
            if (existeNotificacaoAtivaMesmoTipo(a.getId(), TipoNotificacaoEnum.LEMBRETE)) {
                continue;
            }

            LocalDateTime now = LocalDateTime.now(zona());
            Notificacao n = new Notificacao();
            n.setTipo(TipoNotificacaoEnum.LEMBRETE);
            n.setStatus(StatusNotificacaoEnum.PENDENTE);
            n.setTentativas(0);
            n.setMensagem(buildMensagemLembrete(a));
            n.setAgendamento(agendamentoRepository.getReferenceById(a.getId()));
            n.setCriadoEm(now);
            n = notificacaoRepository.save(n);
            tentarEnviar(n.getId(), false);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void reprocessarFilaPeriodicamente() {
        int limite = props.getMaxSendAttempts();
        List<Notificacao> pendencias =
                new ArrayList<>(
                        notificacaoRepository.findParaReprocessarEnvio(
                                LocalDateTime.now(zona()),
                                StatusNotificacaoEnum.PENDENTE,
                                StatusNotificacaoEnum.FALHOU,
                                limite));
        for (Notificacao n : pendencias) {
            Notificacao carregado = notificacaoRepository.findById(n.getId()).orElse(null);
            if (carregado == null) {
                continue;
            }
            if (carregado.getStatus() == StatusNotificacaoEnum.ENVIADO) {
                continue;
            }
            if (descartarSeAgendamentoNaoEnviaNotificacao(carregado)) {
                continue;
            }
            tentarEnviar(carregado.getId(), true);
        }
    }

    private boolean descartarSeAgendamentoNaoEnviaNotificacao(Notificacao n) {
        Agendamento a = n.getAgendamento();
        if (a == null) {
            return false;
        }
        Integer agId = a.getId();
        Agendamento full = agendamentoRepository.findById(agId).orElse(null);
        if (full == null) {
            return false;
        }
        if (TipoNotificacaoEnum.CONFIRMACAO.equals(n.getTipo())) {
            if (full.getStatus() != StatusAgendamentoEnum.AGENDADO) {
                n.setStatus(StatusNotificacaoEnum.DESCARTADA);
                n.setProximaRetentativa(null);
                notificacaoRepository.save(n);
                return true;
            }
        }
        if (TipoNotificacaoEnum.LEMBRETE.equals(n.getTipo())) {
            if (full.getStatus() != StatusAgendamentoEnum.AGENDADO
                    && full.getStatus() != StatusAgendamentoEnum.CONFIRMADO) {
                n.setStatus(StatusNotificacaoEnum.DESCARTADA);
                n.setProximaRetentativa(null);
                notificacaoRepository.save(n);
                return true;
            }
        }
        return false;
    }

    private Agendamento carregarOuLog(Integer id) {
        return agendamentoRepository
                .findByIdWithRelations(id)
                .orElseGet(
                        () -> {
                            log.warn("Agendamento {} nao encontrado ao montar confirmacao WhatsApp.", id);
                            return null;
                        });
    }

    private String buildMensagemConfirmacao(Agendamento a) {
        String nome = a.getCliente().getNome();
        String servico = a.getServico().getNome();
        String dia = a.getData().format(FMT_PT);
        String hora = a.getHoraInicio().format(HORA_PT);
        int idAg = a.getId();
        return "Olá, "
                + nome
                + "!\n\n"
                + "Seu atendimento de "
                + servico
                + " está agendado para o dia "
                + dia
                + ", às "
                + hora
                + ".\n\n"
                + "Por favor, confirme sua presença:\n\n"
                + "✔ Toque no botão abaixo\n"
                + "ou\n"
                + "✔ Responda: SIM "
                + idAg
                + " ou NÃO "
                + idAg
                + "\n\n"
                + "Protocolo: AG"
                + idAg;
    }

    private String buildMensagemLembrete(Agendamento a) {
        return "Lembrete: amanha ("
                + a.getData().format(FMT_PT)
                + " as "
                + a.getHoraInicio().format(HORA_PT)
                + ") voce tem atendimento "
                + a.getServico().getNome()
                + " agendado. Ate logo!";
    }

    private String montarVariaveisJsonQuickReplyConfirmacao(Agendamento a) {
        LinkedHashMap<String, Object> m = new LinkedHashMap<>();
        int idAg = a.getId();
        m.put("1", a.getCliente().getNome());
        m.put("2", a.getServico().getNome());
        m.put("3", a.getData().format(FMT_PT));
        m.put("4", a.getHoraInicio().format(HORA_PT));
        m.put("5", String.valueOf(idAg));
        m.put("6", "CONFIRMAR_" + idAg);
        m.put("7", "CANCELAR_" + idAg);
        try {
            return OM.writeValueAsString(m);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Falha ao serializar ContentVariables Twilio.", e);
        }
    }

    public void enviarAvisoRecepcaoPacienteNegativo(
            Integer agId, String nomePaciente, LocalDate dataAtendimento, String horaIso, String telefoneFrom) {
        if (!props.isTwilioEnabled()
                || props.getEstablishmentAlertTo() == null
                || props.getEstablishmentAlertTo().isBlank()) {
            log.warn(
                    "[ALERTA_RECEPCAO] Paciente ({}) numero {} informou NAO_COMPARECIMENTO relativamente ao "
                            + "agendamento id={}. Configure app.notifications.establishment-alert-to e habilite Twilio para WhatsApp.",
                    nomePaciente,
                    telefoneFrom,
                    agId);
            return;
        }
        String msg = "[Fisa Saude] O paciente "
                + nomePaciente
                + " (tel "
                + telefoneFrom
                + ") respondeu que NAO "
                + "pode ao agendamento id="
                + agId
                + " em "
                + dataAtendimento
                + " "
                + horaIso
                + ". Prosseguir contato manual.";
        try {
            twilioWhatsappSender.enviarTextoParaWhatsapp(props.getEstablishmentAlertTo(), msg);
        } catch (Exception e) {
            log.error("Falha ao enviar alerta recepcao: {}", e.toString());
        }
    }

    private void tentarEnviar(Integer notificacaoId, boolean repeticaoPorScheduler) {
        Notificacao n = notificacaoRepository.findById(notificacaoId).orElse(null);
        if (n == null) {
            return;
        }
        if (n.getStatus() == StatusNotificacaoEnum.ENVIADO || n.getStatus() == StatusNotificacaoEnum.DESCARTADA) {
            return;
        }

        Agendamento a = agendamentoRepository.findByIdWithRelations(n.getAgendamento().getId()).orElse(null);
        if (a == null) {
            return;
        }

        if (TipoNotificacaoEnum.CONFIRMACAO.equals(n.getTipo())) {
            if (a.getStatus() != StatusAgendamentoEnum.AGENDADO) {
                n.setStatus(StatusNotificacaoEnum.DESCARTADA);
                n.setProximaRetentativa(null);
                notificacaoRepository.save(n);
                return;
            }
        }
        if (TipoNotificacaoEnum.LEMBRETE.equals(n.getTipo())) {
            if (a.getStatus() != StatusAgendamentoEnum.AGENDADO
                    && a.getStatus() != StatusAgendamentoEnum.CONFIRMADO) {
                n.setStatus(StatusNotificacaoEnum.DESCARTADA);
                n.setProximaRetentativa(null);
                notificacaoRepository.save(n);
                return;
            }
        }
        if (!Boolean.TRUE.equals(a.getCliente().getWhatsappAtivo())) {
            n.setStatus(StatusNotificacaoEnum.DESCARTADA);
            n.setProximaRetentativa(null);
            notificacaoRepository.save(n);
            return;
        }

        if (!props.isTwilioEnabled()) {
            log.warn(
                    "Twilio desabilitado — notificacao id={} agendamento={} ficou DESCARTADA (sem disparo)",
                    n.getId(),
                    a.getId());
            n.setStatus(StatusNotificacaoEnum.DESCARTADA);
            n.setProximaRetentativa(null);
            notificacaoRepository.save(n);
            return;
        }

        if (repeticaoPorScheduler) {
            if (n.getStatus() == StatusNotificacaoEnum.FALHOU) {
                if (n.getProximaRetentativa() == null
                        || n.getProximaRetentativa().isAfter(LocalDateTime.now(zona()))) {
                    return;
                }
            }
        }

        LocalDateTime now = LocalDateTime.now(zona());
        try {
            String sid;
            if (TipoNotificacaoEnum.CONFIRMACAO.equals(n.getTipo())) {
                String contentSid = props.getWhatsapp().getContentSid();
                if (contentSid == null || contentSid.isBlank()) {
                    contentSid = props.getConfirmacaoWhatsappContentSid();
                }
                sid =
                        twilioWhatsappSender.enviarConfirmacaoAgendamento(
                                a.getCliente().getTelefone(),
                                props.getWhatsapp().isUsarTemplate(),
                                contentSid,
                                props.getConfirmacaoWhatsappMessagingServiceSid(),
                                montarVariaveisJsonQuickReplyConfirmacao(a),
                                n.getMensagem());
            } else {
                sid = twilioWhatsappSender.enviarTextoParaWhatsapp(a.getCliente().getTelefone(), n.getMensagem());
            }
            n.setTwilioMessageSid(sid);
            n.setStatus(StatusNotificacaoEnum.ENVIADO);
            n.setEnviadoEm(now);
            n.setProximaRetentativa(null);
            log.info("Notificacao {} ENVIADO sid={} agendamento={}", n.getId(), sid, a.getId());
        } catch (Exception e) {
            int proximaTentativa = (n.getTentativas() == null ? 0 : n.getTentativas()) + 1;
            n.setTentativas(proximaTentativa);
            n.setStatus(StatusNotificacaoEnum.FALHOU);
            Duration gap = Duration.ofHours(1);
            if (proximaTentativa >= props.getMaxSendAttempts()) {
                log.error("Desistindo notificacao id={} pos {} falhas: {}", n.getId(), proximaTentativa, e.toString());
                n.setStatus(StatusNotificacaoEnum.DESCARTADA);
                n.setProximaRetentativa(null);
            } else {
                n.setProximaRetentativa(now.plus(gap));
                log.warn(
                        "Falha envio notificacao id={}, tentativa {}/{}, proxima {}",
                        n.getId(),
                        proximaTentativa,
                        props.getMaxSendAttempts(),
                        n.getProximaRetentativa());
            }
        }
        notificacaoRepository.save(n);
    }
}
