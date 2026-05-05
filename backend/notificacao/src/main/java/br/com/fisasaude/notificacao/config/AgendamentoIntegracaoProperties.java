package br.com.fisasaude.notificacao.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.integracao.agendamento")
public class AgendamentoIntegracaoProperties {

    private String baseUrl = "http://localhost:8080";

    /** Mesmo valor configurado em app.internal.api-key no servico de agendamento. */
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
