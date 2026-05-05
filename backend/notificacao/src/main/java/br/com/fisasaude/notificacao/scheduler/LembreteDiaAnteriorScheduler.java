package br.com.fisasaude.notificacao.scheduler;

import br.com.fisasaude.notificacao.integration.agendamento.AgendamentoIntegracaoCliente;
import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import br.com.fisasaude.notificacao.integration.agendamento.AgendamentoLembreteDto;
import br.com.fisasaude.notificacao.integration.twilio.TwilioWhatsappSender;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Component;

@Component
public class LembreteDiaAnteriorScheduler implements SchedulingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(LembreteDiaAnteriorScheduler.class);
    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private final AgendamentoIntegracaoCliente agendamentoIntegracaoCliente;
    private final TwilioWhatsappSender twilioWhatsappSender;
    private final NotificacaoAppProperties props;

    public LembreteDiaAnteriorScheduler(
            AgendamentoIntegracaoCliente agendamentoIntegracaoCliente,
            TwilioWhatsappSender twilioWhatsappSender,
            NotificacaoAppProperties props) {
        this.agendamentoIntegracaoCliente = agendamentoIntegracaoCliente;
        this.twilioWhatsappSender = twilioWhatsappSender;
        this.props = props;
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        registrar.addTriggerTask(
                () -> {
                    ZoneId z = ZoneId.of(props.getTimezone());
                    LocalDate amanha = LocalDate.now(z).plusDays(1);
                    log.info("Scheduler lembrete D-1: buscando confirmados em {}", amanha);
                    List<AgendamentoLembreteDto> confirmados =
                            agendamentoIntegracaoCliente.buscarConfirmadosParaLembrete(amanha);
                    for (AgendamentoLembreteDto agendamento : confirmados) {
                        String msg = "⏰ Lembrete:\nSeu atendimento é amanhã às "
                                + agendamento.horaInicio().format(HORA_FMT)
                                + ".\nNos vemos lá 👍";
                        try {
                            twilioWhatsappSender.enviarTextoParaWhatsapp(agendamento.telefoneCliente(), msg);
                        } catch (Exception e) {
                            log.warn(
                                    "Falha envio lembrete agendamentoId={} telefone={} erro={}",
                                    agendamento.agendamentoId(),
                                    agendamento.telefoneCliente(),
                                    e.toString());
                        }
                    }
                },
                new CronTrigger(props.getLembreteCron(), ZoneId.of(props.getTimezone())));
    }
}
