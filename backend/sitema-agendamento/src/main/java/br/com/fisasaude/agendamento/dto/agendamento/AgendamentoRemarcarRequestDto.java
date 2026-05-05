package br.com.fisasaude.agendamento.dto.agendamento;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;

@Schema(description = "Nova data e horarios para AGENDADO; opcionalmente troca usuario e servico.")
public record AgendamentoRemarcarRequestDto(
        @Schema(description = "Nova data") @NotNull @FutureOrPresent LocalDate data,
        @Schema(description = "Nova hora inicial") @NotNull LocalTime horaInicio,
        @Schema(description = "Nova hora final") @NotNull LocalTime horaFim,
        @Schema(description = "Se omitido, mantem o instrutor atual")
        Integer usuarioId,
        @Schema(description = "Se omitido, mantem o servico atual") Integer servicoId
) {}
