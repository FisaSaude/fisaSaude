package br.com.fisasaude.notificacao.integration.agendamento;

import br.com.fisasaude.notificacao.config.AgendamentoIntegracaoProperties;
import br.com.fisasaude.notificacao.model.enums.RespostaWhatsappTipoEnum;
import java.time.LocalDate;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * Aciona o dominio de agendamento apos registrar a mensagem inbound (webhook).
 * A regra de mudanca de status fica em {@code AgendamentoService} do outro microsservico.
 */
@Component
public class AgendamentoIntegracaoCliente {

    private static final Logger log = LoggerFactory.getLogger(AgendamentoIntegracaoCliente.class);
    private static final String INTERNAL_HEADER = "X-Internal-Token";

    private final RestClient restClient;
    private final AgendamentoIntegracaoProperties props;

    public AgendamentoIntegracaoCliente(
            @Qualifier("agendamentoRestClient") RestClient agendamentoRestClient,
            AgendamentoIntegracaoProperties props) {
        this.restClient = agendamentoRestClient;
        this.props = props;
    }

    /** Envia apenas classificacoes que podem alterar status (SIM/NAO). */
    public void notificarRespostaWhatsapp(Integer agendamentoId, RespostaWhatsappTipoEnum tipo) {
        if (agendamentoId == null || tipo == null) {
            return;
        }
        if (tipo != RespostaWhatsappTipoEnum.SIM && tipo != RespostaWhatsappTipoEnum.NAO) {
            return;
        }
        String base = props.getBaseUrl();
        if (base == null || base.isBlank()) {
            log.warn(
                    "Integracao agendamento base-url vazia — nao foi possivel aplicar transicao whatsapp para agendamento {}.",
                    agendamentoId);
            return;
        }
        try {
            record Body(RespostaWhatsappTipoEnum tipo) {}
            log.info(
                    "Chamando agendamento: baseUrl={}, agendamentoId={}, tipo={}",
                    props.getBaseUrl(),
                    agendamentoId,
                    tipo);
            var response = restClient
                    .post()
                    .uri("/internal/v1/agendamentos/{id}/resposta-whatsapp", agendamentoId)
                    .contentType(MediaType.APPLICATION_JSON)
                    .headers(h -> {
                        String key = props.getInternalApiKey();
                        if (key != null && !key.isBlank()) {
                            h.set(INTERNAL_HEADER, key);
                        }
                    })
                    .body(new Body(tipo))
                    .retrieve()
                    .toBodilessEntity();
            log.info(
                    "Dominio agendamento notificado: agendamentoId={} tipoRespostaWhatsApp={} httpStatus={}",
                    agendamentoId,
                    tipo,
                    response.getStatusCode());
        } catch (Exception e) {
            log.error("Erro ao chamar agendamento", e);
        }
    }

    public List<AgendamentoLembreteDto> buscarConfirmadosParaLembrete(LocalDate data) {
        String base = props.getBaseUrl();
        if (base == null || base.isBlank() || data == null) {
            return List.of();
        }
        try {
            var response = restClient
                    .get()
                    .uri("/internal/v1/agendamentos/lembretes-confirmados?data={data}", data)
                    .headers(h -> {
                        String key = props.getInternalApiKey();
                        if (key != null && !key.isBlank()) {
                            h.set(INTERNAL_HEADER, key);
                        }
                    })
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<AgendamentoLembreteDto>>() {});
            return response == null ? List.of() : response;
        } catch (Exception e) {
            log.error("Erro ao buscar confirmados para lembrete no agendamento", e);
            return List.of();
        }
    }
}
