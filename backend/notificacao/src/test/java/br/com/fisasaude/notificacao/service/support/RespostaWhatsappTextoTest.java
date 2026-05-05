package br.com.fisasaude.notificacao.service.support;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.fisasaude.notificacao.model.enums.RespostaWhatsappTipoEnum;
import java.util.stream.Stream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.EmptySource;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullSource;
import org.junit.jupiter.params.provider.ValueSource;

class RespostaWhatsappTextoTest {

    @ParameterizedTest
    @NullSource
    @EmptySource
    @ValueSource(strings = {" ", "talvez compareco", "   okAY   "})
    void classificar_outros(String body) {
        assertThat(RespostaWhatsappTexto.classificarRespostaPaciente(body))
                .isEqualTo(RespostaWhatsappTipoEnum.OUTRO);
    }

    static Stream<Arguments> casosSim() {
        return Stream.of(
                Arguments.of("sim", RespostaWhatsappTipoEnum.SIM),
                Arguments.of("SIM", RespostaWhatsappTipoEnum.SIM),
                Arguments.of("  Sim  ", RespostaWhatsappTipoEnum.SIM),
                Arguments.of("\nSIM\n", RespostaWhatsappTipoEnum.SIM),
                Arguments.of("sim\r\n", RespostaWhatsappTipoEnum.SIM),
                Arguments.of(" \t sim \n ", RespostaWhatsappTipoEnum.SIM),
                Arguments.of("SiM!", RespostaWhatsappTipoEnum.SIM),
                Arguments.of("confirmo que vou", RespostaWhatsappTipoEnum.SIM),
                Arguments.of("correto", RespostaWhatsappTipoEnum.SIM),
                Arguments.of("OK", RespostaWhatsappTipoEnum.SIM),
                Arguments.of("confírm ", RespostaWhatsappTipoEnum.SIM));
    }

    @ParameterizedTest
    @MethodSource("casosSim")
    void classificar_sim(String body, RespostaWhatsappTipoEnum esperado) {
        assertThat(RespostaWhatsappTexto.classificarRespostaPaciente(body)).isEqualTo(esperado);
    }

    static Stream<Arguments> casosNao() {
        return Stream.of(
                Arguments.of("nao posso", RespostaWhatsappTipoEnum.NAO),
                Arguments.of("NÃO", RespostaWhatsappTipoEnum.NAO),
                Arguments.of("nao tenho como", RespostaWhatsappTipoEnum.NAO),
                Arguments.of("\nnao\n", RespostaWhatsappTipoEnum.NAO),
                Arguments.of("  nao  ", RespostaWhatsappTipoEnum.NAO),
                Arguments.of("  NAO  ", RespostaWhatsappTipoEnum.NAO));
    }

    @ParameterizedTest
    @MethodSource("casosNao")
    void classificar_nao(String body, RespostaWhatsappTipoEnum esperado) {
        assertThat(RespostaWhatsappTexto.classificarRespostaPaciente(body)).isEqualTo(esperado);
    }

    @Test
    void conteudoParaPersistencia_colapsaQuebrasDeLinha() {
        assertThat(RespostaWhatsappTexto.conteudoParaPersistencia("  a\n\nb\tc  ")).isEqualTo("a b c");
    }

    @ParameterizedTest
    @CsvSource({
            "quero remarcar, REAGENDAR",
            "REMARCAR amanha, REAGENDAR",
    })
    void classificar_reagendar(String body, RespostaWhatsappTipoEnum esperado) {
        assertThat(RespostaWhatsappTexto.classificarRespostaPaciente(body)).isEqualTo(esperado);
    }

    @Test
    void ordem_precedencia_confirm_antes_de_fragmento_nao() {
        assertThat(RespostaWhatsappTexto.classificarRespostaPaciente("nao confirmo"))
                .isEqualTo(RespostaWhatsappTipoEnum.SIM);
    }
}
