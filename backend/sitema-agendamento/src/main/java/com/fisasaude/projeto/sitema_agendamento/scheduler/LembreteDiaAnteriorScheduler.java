package com.fisasaude.projeto.sitema_agendamento.scheduler;

import com.fisasaude.projeto.sitema_agendamento.config.NotificacaoAppProperties;
import com.fisasaude.projeto.sitema_agendamento.service.NotificacaoDispatchService;
import java.time.LocalDate;
import java.time.ZoneId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Component;

@Component
public class LembreteDiaAnteriorScheduler implements SchedulingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(LembreteDiaAnteriorScheduler.class);

    private final NotificacaoDispatchService dispatchService;
    private final NotificacaoAppProperties props;

    public LembreteDiaAnteriorScheduler(NotificacaoDispatchService dispatchService, NotificacaoAppProperties props) {
        this.dispatchService = dispatchService;
        this.props = props;
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        registrar.addTriggerTask(
                () -> {
                    ZoneId z = ZoneId.of(props.getTimezone());
                    LocalDate amanha = LocalDate.now(z).plusDays(1);
                    log.info("Scheduler lembrete D-1: processando para atendimento em {}", amanha);
                    dispatchService.garantirSomenteUmLembreteParaData(amanha);
                },
                new CronTrigger(props.getLembreteCron(), ZoneId.of(props.getTimezone()))
        );
    }
}
