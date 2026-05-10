package br.com.fisasaude.agendamento.dto.prontuario;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record ProntuarioUpdateRequestDto(
    @NotNull String observacoes
) {}

