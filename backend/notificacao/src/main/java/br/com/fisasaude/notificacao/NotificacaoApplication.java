package br.com.fisasaude.notificacao;

import br.com.fisasaude.notificacao.config.AgendamentoIntegracaoProperties;
import br.com.fisasaude.notificacao.config.InternalApiProperties;
import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
    NotificacaoAppProperties.class,
    InternalApiProperties.class,
    AgendamentoIntegracaoProperties.class
})
public class NotificacaoApplication {

    public static void main(String[] args) {
        SpringApplication.run(NotificacaoApplication.class, args);
    }
}
