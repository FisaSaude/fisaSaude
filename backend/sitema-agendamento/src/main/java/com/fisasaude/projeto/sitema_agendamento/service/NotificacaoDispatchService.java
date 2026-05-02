package com.fisasaude.projeto.sitema_agendamento.service;

import com.fisasaude.projeto.sitema_agendamento.config.NotificacaoAppProperties;
import com.fisasaude.projeto.sitema_agendamento.integration.twilio.TwilioWhatsappSender;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Agendamento;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Cliente;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Notificacao;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusAgendamentoEnum;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusNotificacaoEnum;
import com.fisasaude.projeto.sitema_agendamento.model.enums.TipoNotificacaoEnum;
import com.fisasaude.projeto.sitema_agendamento.repository.AgendamentoRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.NotificacaoRepository;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificacaoDispatchService {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoDispatchService.class);
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
            NotificacaoAppProperties props
    ) {
        this.agendamentoRepository = agendamentoRepository;
        this.notificacaoRepository = notificacaoRepository;
        this.twilioWhatsappSender = twilioWhatsappSender;
        this.props = props;
    }

    public ZoneId zona() {
        return ZoneId.of(props.getTimezone());
    }

    /** Uma linha ATIVA = status diferente de DESCARTADA por (agendamento, tipo). */
    public boolean existeNotificacaoAtivaMesmoTipo(Integer agendamentoId, TipoNotificacaoEnum tipo) {
        return notificacaoRepository.existsByAgendamento_IdAndTipoAndStatusNot(
                agendamentoId,
                tipo,
                StatusNotificacaoEnum.DESCARTADA
        );
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void descartarConfirmacaoElembreteParaAgendamento(Integer agendamentoId) {
        marcarTipoDescarte(agendamentoId, TipoNotificacaoEnum.CONFIRMACAO);
        marcarTipoDescarte(agendamentoId, TipoNotificacaoEnum.LEMBRETE);
    }

    private void marcarTipoDescarte(Integer agendamentoId, TipoNotificacaoEnum tipo) {
        List<Notificacao> lista = notificacaoRepository.findByAgendamento_IdAndTipoAndStatusNotIn(
                agendamentoId,
                tipo,
                List.of(StatusNotificacaoEnum.DESCARTADA)
        );
        if (lista.isEmpty()) {
            return;
        }
        for (Notificacao n : lista) {
            n.setStatus(StatusNotificacaoEnum.DESCARTADA);
            n.setProximaRetentativa(null);
        }
        notificacaoRepository.saveAll(lista);
    }

    /** Nova transacao: seguro quando chamado pelo listener AFTER_COMMIT ou scheduler. */
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
        Agendamento ref = agendamentoRepository.getReferenceById(aBase.getId());
        n.setAgendamento(ref);
        n.setCriadoEm(now);
        n = notificacaoRepository.save(n);

        tentarEnviar(n.getId(), false);
    }

    /** D-1: {@code dataAtendimento} e o dia da consulta (ex.: amanha vista de hoje). */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void garantirSomenteUmLembreteParaData(LocalDate dataAtendimentoAgendamentos) {
        List<Agendamento> fila =
                agendamentoRepository.findAgendamentosParaLembrete(dataAtendimentoAgendamentos, StatusAgendamentoEnum.AGENDADO);
        for (Agendamento stub : fila) {
            Agendamento a = agendamentoRepository.findByIdWithRelations(stub.getId()).orElse(null);
            if (a == null || a.getStatus() != StatusAgendamentoEnum.AGENDADO) {
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
        List<Notificacao> pendencias = new ArrayList<>(
                notificacaoRepository.findParaReprocessarEnvio(
                        LocalDateTime.now(zona()),
                        StatusNotificacaoEnum.PENDENTE,
                        StatusNotificacaoEnum.FALHOU,
                        limite
                ));
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
        if (TipoNotificacaoEnum.LEMBRETE.equals(n.getTipo())
                || TipoNotificacaoEnum.CONFIRMACAO.equals(n.getTipo())) {
            if (full.getStatus() != StatusAgendamentoEnum.AGENDADO) {
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
                .orElseGet(() -> {
                    log.warn("Agendamento {} nao encontrado ao montar confirmacao WhatsApp.", id);
                    return null;
                });
    }

    private String buildMensagemConfirmacao(Agendamento a) {
        return "Ola "
                + a.getCliente().getNome()
                + "! Seu atendimento ("
                + a.getServico().getNome()
                + ") ficou AGENDADO para "
                + a.getData().format(FMT_PT)
                + " as "
                + a.getHoraInicio().format(HORA_PT)
                + ". Responda SIM para confirmar. Se NAO pode comparecer, responda NAO (a recepcao sera avisada).";
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

    public void enviarAvisoRecepcaoPacienteNegativo(Integer agId, Integer clienteId, String nomePaciente,
            LocalDate dataAtendimento, String horaIso, String telefoneFrom) {
        if (!props.isTwilioEnabled() || props.getEstablishmentAlertTo() == null
                || props.getEstablishmentAlertTo().isBlank()) {
            log.warn("[ALERTA_RECEPCAO] Paciente ({}) numero {} informou NAO_COMPARECIMENTO relativamente ao "
                            + "agendamento id={}. Configure app.notifications.establishment-alert-to e habilite Twilio para WhatsApp.",
                    nomePaciente,
                    telefoneFrom,
                    agId);
            return;
        }
        String msg = "[Fisa Saude] O paciente " + nomePaciente + " (tel " + telefoneFrom + ") respondeu que NAO "
                + "pode ao agendamento id=" + agId + " em " + dataAtendimento + " " + horaIso + ". Prosseguir contato manual.";
        try {
            twilioWhatsappSender.enviarTextoParaWhatsapp(props.getEstablishmentAlertTo(), msg);
        } catch (Exception e) {
            log.error("Falha ao enviar alerta recepcao: {}", e.toString());
        }
    }

    /** Unico lugar que marca ENVIADO / FALHOU / retries. */
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

        boolean tipoCliente = TipoNotificacaoEnum.LEMBRETE.equals(n.getTipo())
                || TipoNotificacaoEnum.CONFIRMACAO.equals(n.getTipo());
        if (tipoCliente && a.getStatus() != StatusAgendamentoEnum.AGENDADO) {
            n.setStatus(StatusNotificacaoEnum.DESCARTADA);
            n.setProximaRetentativa(null);
            notificacaoRepository.save(n);
            return;
        }
        if (!Boolean.TRUE.equals(a.getCliente().getWhatsappAtivo())) {
            n.setStatus(StatusNotificacaoEnum.DESCARTADA);
            n.setProximaRetentativa(null);
            notificacaoRepository.save(n);
            return;
        }

        if (!props.isTwilioEnabled()) {
            log.warn("Twilio desabilitado — notificacao id={} agendamento={} ficou DESCARTADA (sem disparo)",
                    n.getId(), a.getId());
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
            String sid = twilioWhatsappSender.enviarTextoParaWhatsapp(a.getCliente().getTelefone(), n.getMensagem());
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
                log.warn("Falha envio notificacao id={}, tentativa {}/{}, proxima {}",
                        n.getId(), proximaTentativa, props.getMaxSendAttempts(), n.getProximaRetentativa());
            }
        }
        notificacaoRepository.save(n);
    }
}
