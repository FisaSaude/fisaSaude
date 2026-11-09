package br.com.fisasaude.agendamento.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.fisasaude.agendamento.dto.servico.ServicoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.servico.ServicoUpdateRequestDto;
import br.com.fisasaude.agendamento.model.entity.Servico;
import java.math.BigDecimal;
import org.junit.jupiter.api.Test;

class ServicoMapperTest {

    private final ServicoMapper mapper = new ServicoMapper();

    @Test
    void toEntity_camposOpcionaisNulos_usaValoresPadrao() {
        ServicoCreateRequestDto dto = new ServicoCreateRequestDto(
                "Pilates",
                "Fisioterapia",
                new BigDecimal("120.00"),
                null,
                null
        );

        Servico servico = mapper.toEntity(dto);

        assertThat(servico.getDuracaoMinutos()).isEqualTo(60);
        assertThat(servico.getAtivo()).isTrue();
    }

    @Test
    void updateEntity_atualizaTodosOsCamposEditaveis() {
        Servico servico = new Servico();
        ServicoUpdateRequestDto dto = new ServicoUpdateRequestDto(
                "Pilates avancado",
                "Fisioterapia",
                new BigDecimal("150.00"),
                90,
                false
        );

        mapper.updateEntity(servico, dto);

        assertThat(servico.getNome()).isEqualTo("Pilates avancado");
        assertThat(servico.getPreco()).isEqualByComparingTo("150.00");
        assertThat(servico.getDuracaoMinutos()).isEqualTo(90);
        assertThat(servico.getAtivo()).isFalse();
    }
}
