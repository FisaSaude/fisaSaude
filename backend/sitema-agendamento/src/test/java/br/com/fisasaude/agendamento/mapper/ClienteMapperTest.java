package br.com.fisasaude.agendamento.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.fisasaude.agendamento.dto.cliente.ClienteCreateRequestDto;
import br.com.fisasaude.agendamento.dto.cliente.ClienteUpdateRequestDto;
import br.com.fisasaude.agendamento.model.entity.Cliente;
import br.com.fisasaude.agendamento.model.enums.SexoEnum;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class ClienteMapperTest {

    private final ClienteMapper mapper = new ClienteMapper();

    @Test
    void toEntity_whatsappAtivoNull_usaTrue() {
        ClienteCreateRequestDto dto = new ClienteCreateRequestDto(
                "Maria",
                "5511999999999",
                null,
                LocalDate.of(1990, 1, 2),
                SexoEnum.F,
                null
        );
        assertThat(mapper.toEntity(dto).getWhatsappAtivo()).isTrue();
    }

    @Test
    void updateEntity_whatsappAtivoNull_usaTrue() {
        Cliente cliente = new Cliente();
        cliente.setWhatsappAtivo(false);
        ClienteUpdateRequestDto dto = new ClienteUpdateRequestDto(
                "Maria",
                "5511999999999",
                null,
                LocalDate.of(1990, 1, 2),
                SexoEnum.F,
                null
        );
        mapper.updateEntity(cliente, dto);
        assertThat(cliente.getWhatsappAtivo()).isTrue();
    }
}
