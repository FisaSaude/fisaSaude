package br.com.fisasaude.agendamento;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

/**
 * Smoke: sobe o contexto Spring com H2 ({@code application-test.yaml}), sem MySQL nem variáveis de ambiente.
 */
@SpringBootTest
@ActiveProfiles("test")
class SitemaAgendamentoApplicationTests {

    @Test
    void contextLoads() {}
}
