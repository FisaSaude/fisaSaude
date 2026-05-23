package br.com.fisasaude.agendamento.dto.agendamento.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;
import java.time.LocalTime;

@Schema(description = "Requisição para bloquear um período de horário de agendamento para um usuário")
public record AgendamentoBloquearPeriodoRequestDto(
        @Schema(description = "ID do usuário (profissional)", example = "1") @NotNull @Positive Integer usuarioId,
        @Schema(description = "Data do bloqueio", example = "2026-06-10") @NotNull LocalDate data,
        @Schema(description = "Hora de início do bloqueio", example = "09:00") @NotNull LocalTime horaInicio,
        @Schema(description = "Hora de fim do bloqueio", example = "11:00") @NotNull LocalTime horaFim
) {}

