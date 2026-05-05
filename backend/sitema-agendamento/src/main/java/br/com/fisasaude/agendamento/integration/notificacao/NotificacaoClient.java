package br.com.fisasaude.agendamento.integration.notificacao;

import br.com.fisasaude.agendamento.config.NotificacaoClientProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClient;

@Component
public class NotificacaoClient {

    private static final Logger log = LoggerFactory.getLogger(NotificacaoClient.class);
    private static final String INTERNAL_HEADER = "X-Internal-Token";

    private final RestClient restClient;
    private final NotificacaoClientProperties props;

    public NotificacaoClient(RestClient notificacaoRestClient, NotificacaoClientProperties props) {
        this.restClient = notificacaoRestClient;
        this.props = props;
    }

    public void solicitarConfirmacaoAposSalvar(Integer agendamentoId) {
        try {
            restClient
                    .post()
                    .uri("/internal/v1/notifications/confirmacao/{id}", agendamentoId)
                    .headers(h -> applyInternalToken(h))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.error(
                    "Falha HTTP ao acionar serviço de notificação (confirmacao) agendamentoId={}: {}",
                    agendamentoId,
                    e.getMessage());
        }
    }

    public void descartarConfirmacaoElembreteParaAgendamento(Integer agendamentoId) {
        try {
            restClient
                    .post()
                    .uri("/internal/v1/notifications/descartar/{id}", agendamentoId)
                    .headers(h -> applyInternalToken(h))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.error(
                    "Falha HTTP ao acionar serviço de notificação (descartar) agendamentoId={}: {}",
                    agendamentoId,
                    e.getMessage());
        }
    }

    public void descartarSomenteConfirmacaoParaAgendamento(Integer agendamentoId) {
        try {
            restClient
                    .post()
                    .uri("/internal/v1/notifications/descartar-confirmacao/{id}", agendamentoId)
                    .headers(h -> applyInternalToken(h))
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException e) {
            log.error(
                    "Falha HTTP ao acionar descarte apenas confirmacao agendamentoId={}: {}",
                    agendamentoId,
                    e.getMessage());
        }
    }

    private void applyInternalToken(org.springframework.http.HttpHeaders h) {
        String key = props.getInternalApiKey();
        if (key != null && !key.isBlank()) {
            h.set(INTERNAL_HEADER, key);
        }
    }
}
