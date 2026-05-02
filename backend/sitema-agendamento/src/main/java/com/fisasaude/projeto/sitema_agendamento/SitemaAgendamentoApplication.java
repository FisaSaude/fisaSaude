package com.fisasaude.projeto.sitema_agendamento;

import com.fisasaude.projeto.sitema_agendamento.config.NotificacaoAppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
@EnableConfigurationProperties(NotificacaoAppProperties.class)
public class SitemaAgendamentoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SitemaAgendamentoApplication.class, args);
	}

}
