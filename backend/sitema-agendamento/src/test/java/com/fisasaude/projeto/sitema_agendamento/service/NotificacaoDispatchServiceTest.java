package com.fisasaude.projeto.sitema_agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fisasaude.projeto.sitema_agendamento.config.NotificacaoAppProperties;
import com.fisasaude.projeto.sitema_agendamento.integration.twilio.TwilioWhatsappSender;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusNotificacaoEnum;
import com.fisasaude.projeto.sitema_agendamento.model.enums.TipoNotificacaoEnum;
import com.fisasaude.projeto.sitema_agendamento.repository.AgendamentoRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.NotificacaoRepository;
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
