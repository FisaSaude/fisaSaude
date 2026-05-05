package br.com.fisasaude.agendamento.dto.cliente;

import br.com.fisasaude.agendamento.model.enums.SexoEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ClienteCreateRequestDto(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 100, message = "Nome deve ter no maximo 100 caracteres")
        String nome,

        @NotBlank(message = "Numero WhatsApp e obrigatorio")
        @Size(max = 20, message = "Numero deve ter no maximo 20 caracteres")
        String telefone,

        Boolean whatsappAtivo,

        @NotNull(message = "dataNascimento e obrigatoria")
        @PastOrPresent(message = "dataNascimento nao pode ser futura")
        LocalDate dataNascimento,

        @NotNull(message = "Sexo e obrigatorio")
        SexoEnum sexo,

        @Size(max = 255, message = "fotoLink deve ter no maximo 255 caracteres")
        String fotoLink
) {
}

