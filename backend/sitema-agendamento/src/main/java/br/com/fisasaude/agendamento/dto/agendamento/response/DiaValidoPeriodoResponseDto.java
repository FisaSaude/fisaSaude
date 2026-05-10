package br.com.fisasaude.agendamento.dto.agendamento.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;

@Schema(description = "Dia no periodo com indicacao de disponibilidade")
public record DiaValidoPeriodoResponseDto(
        LocalDate data,
        boolean disponivel
) {
}
