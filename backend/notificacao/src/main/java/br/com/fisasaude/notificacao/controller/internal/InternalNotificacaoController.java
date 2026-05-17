package br.com.fisasaude.notificacao.controller.internal;

import br.com.fisasaude.notificacao.dto.LembreteDisparoResponseDto;
import br.com.fisasaude.notificacao.service.LembreteDiaAnteriorService;
import br.com.fisasaude.notificacao.service.NotificacaoDispatchService;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/notifications")
public class InternalNotificacaoController {

    private final NotificacaoDispatchService dispatchService;
    private final LembreteDiaAnteriorService lembreteDiaAnteriorService;

    public InternalNotificacaoController(
            NotificacaoDispatchService dispatchService, LembreteDiaAnteriorService lembreteDiaAnteriorService) {
        this.dispatchService = dispatchService;
        this.lembreteDiaAnteriorService = lembreteDiaAnteriorService;
    }

    @PostMapping("/confirmacao/{agendamentoId}")
    public ResponseEntity<Void> solicitadoConfirmacao(@PathVariable Integer agendamentoId) {
        dispatchService.solicitadoConfirmacaoAposSalvar(agendamentoId);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    @PostMapping("/descartar/{agendamentoId}")
    public ResponseEntity<Void> descartar(@PathVariable Integer agendamentoId) {
        dispatchService.descartarConfirmacaoElembreteParaAgendamento(agendamentoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/descartar-confirmacao/{agendamentoId}")
    public ResponseEntity<Void> descartarSomenteConfirmacao(@PathVariable Integer agendamentoId) {
        dispatchService.descartarSomenteConfirmacaoParaAgendamento(agendamentoId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Disparo manual do lembrete D-1 (mesma regra do cron às 15h).
     * Sem {@code data}, usa o dia seguinte no fuso {@code app.notifications.timezone}.
     */
    @PostMapping("/lembretes/disparar")
    public ResponseEntity<LembreteDisparoResponseDto> dispararLembretesDiaAnterior(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data) {
        LocalDate dataAtendimento = data != null ? data : lembreteDiaAnteriorService.dataPadraoDiaSeguinte();
        return ResponseEntity.ok(lembreteDiaAnteriorService.dispararLembretesParaData(dataAtendimento));
    }
}
