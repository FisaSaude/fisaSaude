package br.com.fisasaude.notificacao.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class AgendamentoIntegracaoClientConfig {

    @Bean(name = "agendamentoRestClient")
    public RestClient agendamentoRestClient(AgendamentoIntegracaoProperties props) {
        String baseUrl = normalizeBaseUrl(props.getBaseUrl());
        return RestClient.builder().baseUrl(baseUrl).build();
    }

    /** Evita barras extras que quebram resolução de URI no RestClient. */
    static String normalizeBaseUrl(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        return raw.trim().replaceAll("/+$", "");
    }
}
