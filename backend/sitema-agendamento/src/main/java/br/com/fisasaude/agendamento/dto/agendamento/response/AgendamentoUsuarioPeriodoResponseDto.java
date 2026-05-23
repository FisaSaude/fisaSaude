package br.com.fisasaude.agendamento.dto.agendamento.response;

import br.com.fisasaude.agendamento.model.enums.StatusAgendamentoEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Schema(description = "Resumo de agendamento por usuario em um periodo")
public record AgendamentoUsuarioPeriodoResponseDto(
        Integer id,
        LocalDate data,
        LocalTime horaInicio,
        LocalTime horaFim,
        @Schema(nullable = true) String nomeCliente,
        StatusAgendamentoEnum status,
        @Schema(nullable = true) BigDecimal preco
) {}
