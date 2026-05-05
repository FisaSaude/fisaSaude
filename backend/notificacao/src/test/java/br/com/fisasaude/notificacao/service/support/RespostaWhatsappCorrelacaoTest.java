package br.com.fisasaude.notificacao.service.support;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import br.com.fisasaude.notificacao.model.entity.Agendamento;
import br.com.fisasaude.notificacao.model.entity.Notificacao;
import br.com.fisasaude.notificacao.model.enums.RespostaWhatsappTipoEnum;
import br.com.fisasaude.notificacao.repository.NotificacaoRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RespostaWhatsappCorrelacaoTest {

    @Mock
    private NotificacaoRepository notificacaoRepository;

    @Test
    void prioritiza_ButtonPayload_CONFIRMAR_id() {
        Optional<RespostaWhatsappCorrelacao.Resultado> r =
                RespostaWhatsappCorrelacao.resolver("CONFIRMAR_42", "", "", notificacaoRepository);
        assertThat(r).isPresent();
        assertThat(r.get().agendamentoId()).isEqualTo(42);
        assertThat(r.get().tipo()).isEqualTo(RespostaWhatsappTipoEnum.SIM);
        assertThat(r.get().origem()).isEqualTo(RespostaWhatsappCorrelacao.OrigemCorrelacao.BUTTON_PAYLOAD);
    }

    @Test
    void body_SIM_id() {
        Optional<RespostaWhatsappCorrelacao.Resultado> r =
                RespostaWhatsappCorrelacao.resolver("", "SIM  99\n", "", notificacaoRepository);
        assertThat(r).isPresent();
        assertThat(r.get().agendamentoId()).isEqualTo(99);
        assertThat(r.get().tipo()).isEqualTo(RespostaWhatsappTipoEnum.SIM);
        assertThat(r.get().origem()).isEqualTo(RespostaWhatsappCorrelacao.OrigemCorrelacao.BODY_SIM_NAO_ID);
    }

    @Test
    void repliedSid_com_classificacao_sim() {
        Notificacao n = new Notificacao();
        Agendamento ag = new Agendamento();
        ag.setId(7);
        n.setAgendamento(ag);

        when(notificacaoRepository.findByTwilioMessageSidWithAgendamento("SMOUTBOUND"))
                .thenReturn(Optional.of(n));

        Optional<RespostaWhatsappCorrelacao.Resultado> r =
                RespostaWhatsappCorrelacao.resolver("", "sim ", "SMOUTBOUND", notificacaoRepository);

        assertThat(r).isPresent();
        assertThat(r.get().agendamentoId()).isEqualTo(7);
        assertThat(r.get().tipo()).isEqualTo(RespostaWhatsappTipoEnum.SIM);
        assertThat(r.get().origem()).isEqualTo(RespostaWhatsappCorrelacao.OrigemCorrelacao.MENSAGEM_ANTERIOR_SID);
    }
}
