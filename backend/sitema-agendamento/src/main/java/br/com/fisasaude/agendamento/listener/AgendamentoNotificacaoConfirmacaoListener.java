package br.com.fisasaude.agendamento.listener;

import br.com.fisasaude.agendamento.event.AgendamentoNotificacaoConfirmacaoEvent;
import br.com.fisasaude.agendamento.integration.notificacao.NotificacaoClient;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
public class AgendamentoNotificacaoConfirmacaoListener {

    private final NotificacaoClient notificacaoClient;

    public AgendamentoNotificacaoConfirmacaoListener(NotificacaoClient notificacaoClient) {
        this.notificacaoClient = notificacaoClient;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void aoCommitAgendamentoOuRemarcacao(AgendamentoNotificacaoConfirmacaoEvent event) {
        notificacaoClient.solicitarConfirmacaoAposSalvar(event.agendamentoId());
    }
}
