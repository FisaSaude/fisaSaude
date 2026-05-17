package br.com.fisasaude.notificacao.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import br.com.fisasaude.notificacao.integration.agendamento.AgendamentoIntegracaoCliente;
import br.com.fisasaude.notificacao.integration.agendamento.AgendamentoLembreteDto;
import br.com.fisasaude.notificacao.integration.twilio.TwilioWhatsappSender;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class LembreteDiaAnteriorServiceTest {

    @Mock
    private AgendamentoIntegracaoCliente agendamentoIntegracaoCliente;

    @Mock
    private TwilioWhatsappSender twilioWhatsappSender;

    private LembreteDiaAnteriorService service;

    @BeforeEach
    void setUp() {
        NotificacaoAppProperties props = new NotificacaoAppProperties();
        props.setTimezone("America/Sao_Paulo");
        service = new LembreteDiaAnteriorService(agendamentoIntegracaoCliente, twilioWhatsappSender, props);
    }

    @Test
    void dispararLembretesParaData_enviaParaConfirmados() {
        LocalDate data = LocalDate.of(2026, 5, 10);
        when(agendamentoIntegracaoCliente.buscarConfirmadosParaLembrete(data))
                .thenReturn(List.of(new AgendamentoLembreteDto(2, "5511988776655", LocalTime.of(10, 0))));

        var resultado = service.dispararLembretesParaData(data);

        assertThat(resultado.totalElegiveis()).isEqualTo(1);
        assertThat(resultado.enviados()).isEqualTo(1);
        assertThat(resultado.falhas()).isZero();
        assertThat(resultado.agendamentoIdsEnviados()).containsExactly(2);
        verify(twilioWhatsappSender).enviarTextoParaWhatsapp(eq("5511988776655"), anyString());
    }
}
