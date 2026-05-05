package br.com.fisasaude.notificacao.controller.internal;

import br.com.fisasaude.notificacao.service.NotificacaoDispatchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/notifications")
public class InternalNotificacaoController {

    private final NotificacaoDispatchService dispatchService;

    public InternalNotificacaoController(NotificacaoDispatchService dispatchService) {
        this.dispatchService = dispatchService;
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
}
