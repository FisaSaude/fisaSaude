package com.fisasaude.projeto.sitema_agendamento.dto;

import com.fisasaude.projeto.sitema_agendamento.model.SexoEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ClienteUpdateRequestDto(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 100, message = "Nome deve ter no maximo 100 caracteres")
        String nome,

        @NotBlank(message = "Telefone e obrigatorio")
        @Size(max = 20, message = "Telefone deve ter no maximo 20 caracteres")
        String telefone,

        @NotNull(message = "dataNascimento e obrigatoria")
        @PastOrPresent(message = "dataNascimento nao pode ser futura")
        LocalDate dataNascimento,

        @NotNull(message = "Sexo e obrigatorio")
        SexoEnum sexo,

        @Size(max = 255, message = "fotoLink deve ter no maximo 255 caracteres")
        String fotoLink
) {
}

