package br.com.fisasaude.agendamento.dto.agendamento.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

@Schema(description = "Requisição para bloquear um dia inteiro de agendamento para um usuário")
public record AgendamentoBloquearDiaRequestDto(
        @NotNull @Positive Integer usuarioId,
        @NotNull LocalDate data
) {}

