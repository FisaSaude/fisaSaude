package br.com.fisasaude.agendamento.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.internal")
public class InternalApiProperties {

    /**
     * Se preenchido, exige header X-Internal-Token igual a este valor em /internal/*. Deve coincidir com
     * {@code app.integracao.agendamento.internal-api-key} no servico de notificacao.
     */
    private String apiKey = "";

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
}
