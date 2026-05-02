package com.fisasaude.projeto.sitema_agendamento.dto.agendamento;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

@Schema(description = "Payload para criar agendamento (status inicial AGENDADO)")
public record AgendamentoCreateRequestDto(
        @Schema(description = "ID do cliente", example = "1") @NotNull @Positive Integer clienteId,
        @Schema(description = "ID do servico", example = "1") @NotNull @Positive Integer servicoId,
        @Schema(description = "ID do usuario (instrutor/responsavel)", example = "1") @NotNull @Positive Integer usuarioId,
        @Schema(description = "Data da aula/compromisso") @NotNull @FutureOrPresent LocalDate data,
        @Schema(description = "Hora inicial", example = "09:00") @NotNull LocalTime horaInicio,
        @Schema(description = "Hora final", example = "10:00") @NotNull LocalTime horaFim,
        @Schema(description = "Observacoes opcionais") @Size(max = 4000) String observacoes
) {}
