package com.fisasaude.projeto.sitema_agendamento;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Smoke com contexto JPA/MySQL inteiro — opção ao rodar com DB local configurado em {@code application.yaml}.
 *
 * <p>O pipeline padrão usa apenas testes unitários (Maven {@code test}) sem datasource.
 */
@Disabled("Smoke local: remover @Disabled quando MySQL estiver acessível aos testes de integração.")
@SpringBootTest
class SitemaAgendamentoApplicationTests {

    @Test
    void contextLoads() {}
}
