package com.fisasaude.projeto.sitema_agendamento.listener;

import com.fisasaude.projeto.sitema_agendamento.event.AgendamentoNotificacaoConfirmacaoEvent;
import com.fisasaude.projeto.sitema_agendamento.service.NotificacaoDispatchService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class AgendamentoNotificacaoConfirmacaoListener {

    private final NotificacaoDispatchService dispatchService;

    public AgendamentoNotificacaoConfirmacaoListener(NotificacaoDispatchService dispatchService) {
        this.dispatchService = dispatchService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void aoCommitAgendamentoOuRemarcacao(AgendamentoNotificacaoConfirmacaoEvent event) {
        dispatchService.solicitadoConfirmacaoAposSalvar(event.agendamentoId());
    }
}
