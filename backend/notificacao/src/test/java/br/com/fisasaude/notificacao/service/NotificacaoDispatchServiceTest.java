package br.com.fisasaude.notificacao.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import br.com.fisasaude.notificacao.integration.twilio.TwilioWhatsappSender;
import br.com.fisasaude.notificacao.model.enums.StatusNotificacaoEnum;
import br.com.fisasaude.notificacao.model.enums.TipoNotificacaoEnum;
import br.com.fisasaude.notificacao.repository.AgendamentoRepository;
import br.com.fisasaude.notificacao.repository.NotificacaoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificacaoDispatchServiceTest {

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @Mock
    private NotificacaoRepository notificacaoRepository;

    @Mock
    private TwilioWhatsappSender twilioWhatsappSender;

    @Mock
    private NotificacaoAppProperties props;

    @InjectMocks
    private NotificacaoDispatchService service;

    @Test
    void existeNotificacaoAtivaMesmoTipo_delega_notificacao_status() {
        when(notificacaoRepository.existsByAgendamento_IdAndTipoAndStatusNot(
                        7, TipoNotificacaoEnum.CONFIRMACAO, StatusNotificacaoEnum.DESCARTADA))
                .thenReturn(true);

        assertThat(service.existeNotificacaoAtivaMesmoTipo(7, TipoNotificacaoEnum.CONFIRMACAO)).isTrue();

        verify(notificacaoRepository)
                .existsByAgendamento_IdAndTipoAndStatusNot(
                        7, TipoNotificacaoEnum.CONFIRMACAO, StatusNotificacaoEnum.DESCARTADA);
    }
}
