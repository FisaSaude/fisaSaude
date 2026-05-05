package br.com.fisasaude.notificacao.scheduler;

import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import br.com.fisasaude.notificacao.service.NotificacaoDispatchService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;
import org.springframework.stereotype.Component;

@Component
public class NotificacaoRetryScheduler implements SchedulingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoRetryScheduler.class);

    private final NotificacaoDispatchService dispatchService;
    private final NotificacaoAppProperties props;

    public NotificacaoRetryScheduler(NotificacaoDispatchService dispatchService, NotificacaoAppProperties props) {
        this.dispatchService = dispatchService;
        this.props = props;
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        registrar.addFixedRateTask(
                () -> {
                    log.debug("Scheduler retry notificacao");
                    dispatchService.reprocessarFilaPeriodicamente();
                },
                props.getRetryFixedRateMs());
    }
}
