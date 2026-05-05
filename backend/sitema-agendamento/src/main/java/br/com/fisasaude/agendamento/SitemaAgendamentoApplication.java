package br.com.fisasaude.agendamento;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class SitemaAgendamentoApplication {

	public static void main(String[] args) {
		SpringApplication.run(SitemaAgendamentoApplication.class, args);
	}

}
