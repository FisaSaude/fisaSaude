package br.com.fisasaude.agendamento.dto.prontuario;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record ProntuarioCreateRequestDto(
    @NotNull String observacoes,
    @NotNull LocalDateTime criadoEm,
    @NotNull Integer clienteId
) {}

