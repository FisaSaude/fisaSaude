package br.com.fisasaude.notificacao.scheduler;

import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import br.com.fisasaude.notificacao.service.LembreteDiaAnteriorService;
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

    private final LembreteDiaAnteriorService lembreteDiaAnteriorService;
    private final NotificacaoAppProperties props;

    public LembreteDiaAnteriorScheduler(
            LembreteDiaAnteriorService lembreteDiaAnteriorService, NotificacaoAppProperties props) {
        this.lembreteDiaAnteriorService = lembreteDiaAnteriorService;
        this.props = props;
    }

    @Override
    public void configureTasks(ScheduledTaskRegistrar registrar) {
        registrar.addTriggerTask(
                () -> {
                    var dataAmanha = lembreteDiaAnteriorService.dataPadraoDiaSeguinte();
                    log.info("Scheduler lembrete D-1 (15h): disparando para atendimentos em {}", dataAmanha);
                    var resultado = lembreteDiaAnteriorService.dispararLembretesParaData(dataAmanha);
                    log.info(
                            "Scheduler lembrete D-1 concluído: elegíveis={} enviados={} falhas={}",
                            resultado.totalElegiveis(),
                            resultado.enviados(),
                            resultado.falhas());
                },
                new CronTrigger(props.getLembreteCron(), ZoneId.of(props.getTimezone())));
    }
}
