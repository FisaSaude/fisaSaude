package br.com.fisasaude.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.model.entity.Agendamento;
import br.com.fisasaude.agendamento.model.entity.Notificacao;
import br.com.fisasaude.agendamento.model.enums.StatusNotificacaoEnum;
import br.com.fisasaude.agendamento.model.enums.TipoNotificacaoEnum;
import br.com.fisasaude.agendamento.repository.NotificacaoRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class NotificacaoServiceTest {

    @Mock
    private NotificacaoRepository notificacaoRepository;

    @InjectMocks
    private NotificacaoService service;

    @Test
    void listarFalhasParaRetry_tentativasMaxInvalida_lancaBadRequest() {
        assertThatThrownBy(() -> service.listarFalhasParaRetry(0)).isInstanceOf(BadRequestException.class);
        assertThatThrownBy(() -> service.listarFalhasParaRetry(-1)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarPendentes_ordenacaoPorProximaRetentativaECriacao() {
        Notificacao a = novaNotificacao(1);
        Notificacao b = novaNotificacao(2);

        LocalDateTime amanha = LocalDateTime.now().plusDays(1);
        a.setProximaRetentativa(amanha);
        a.setCriadoEm(LocalDateTime.now().minusHours(5));

        b.setProximaRetentativa(LocalDateTime.now().plusMinutes(30));
        b.setCriadoEm(LocalDateTime.now().minusHours(1));

        when(notificacaoRepository.findByStatus(StatusNotificacaoEnum.PENDENTE)).thenReturn(List.of(a, b));

        assertThat(service.listarPendentesOrdenadas().getFirst().id()).isEqualTo(2);
    }

    private static Notificacao novaNotificacao(int id) {
        Notificacao n = new Notificacao();
        n.setId(id);
        n.setStatus(StatusNotificacaoEnum.PENDENTE);
        n.setTipo(TipoNotificacaoEnum.CONFIRMACAO);
        n.setTentativas(0);
        Agendamento ag = new Agendamento();
        ag.setId(id + 99);
        n.setAgendamento(ag);
        return n;
    }
}
