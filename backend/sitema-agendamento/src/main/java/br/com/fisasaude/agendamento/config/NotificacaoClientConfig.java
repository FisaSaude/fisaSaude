package br.com.fisasaude.agendamento.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
@EnableConfigurationProperties({NotificacaoClientProperties.class, InternalApiProperties.class})
public class NotificacaoClientConfig {

    @Bean
    RestClient notificacaoRestClient(NotificacaoClientProperties properties) {
        return RestClient.builder().baseUrl(properties.getBaseUrl()).build();
    }
}
