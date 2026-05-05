package br.com.fisasaude.agendamento.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notificacao")
public class NotificacaoClientProperties {

    private String baseUrl = "http://localhost:8081";

    /** O mesmo valor configurado em app.internal.api-key no serviço de notificação (header X-Internal-Token). */
    private String internalApiKey = "";

    public String getBaseUrl() {
        return baseUrl;
    }

    public void setBaseUrl(String baseUrl) {
        this.baseUrl = baseUrl;
    }

    public String getInternalApiKey() {
        return internalApiKey;
    }

    public void setInternalApiKey(String internalApiKey) {
        this.internalApiKey = internalApiKey;
    }
}
