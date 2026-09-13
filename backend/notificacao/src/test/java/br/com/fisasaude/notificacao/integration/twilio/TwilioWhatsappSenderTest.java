package br.com.fisasaude.notificacao.integration.twilio;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class TwilioWhatsappSenderTest {

    @Test
    void brasilComDdiViraWhatsappE164() {
        assertThat(TwilioWhatsappSender.garantirPrefixoWhatsapp("5511965643020"))
                .isEqualTo("whatsapp:+5511965643020");
        assertThat(TwilioWhatsappSender.garantirPrefixoWhatsapp("whatsapp:+5511965643020"))
                .isEqualTo("whatsapp:+5511965643020");
    }

    @Test
    void celularSpSemDdiNaoPodeIrComoMais1Americano() {
        assertThat(TwilioWhatsappSender.garantirPrefixoWhatsapp("11965643020"))
                .isEqualTo("whatsapp:+5511965643020");
        assertThat(TwilioWhatsappSender.garantirPrefixoWhatsapp("(11) 96564-3020"))
                .isEqualTo("whatsapp:+5511965643020");
    }

    @Test
    void sandboxAmericanoNaoGanha55() {
        assertThat(TwilioWhatsappSender.garantirPrefixoWhatsapp("whatsapp:+14155238886"))
                .isEqualTo("whatsapp:+14155238886");
        assertThat(TwilioWhatsappSender.garantirPrefixoWhatsapp("+14155238886"))
                .isEqualTo("whatsapp:+14155238886");
    }

    @Test
    void vazioLanca() {
        assertThatThrownBy(() -> TwilioWhatsappSender.garantirPrefixoWhatsapp(" "))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
