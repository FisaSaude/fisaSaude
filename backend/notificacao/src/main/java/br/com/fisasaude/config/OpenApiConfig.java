package br.com.fisasaude.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Serviço de Notificações API")
                        .description("API para gerenciamento de notificações via WhatsApp e Webhooks")
                        .version("v1")
                        .contact(new Contact().name("Equipe Fisa Saude"))
                        .license(new License().name("Uso interno")));
    }
}
