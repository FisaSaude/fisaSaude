package br.com.fisasaude.notificacao.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.internal")
public class InternalApiProperties {

    /** Quando definido, exige header X-Internal-Token igual a este valor nas rotas /internal/*. */
    private String apiKey = "";

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }
}
