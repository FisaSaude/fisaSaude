package br.com.fisasaude.agendamento.dto.servico;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ServicoUpdateRequestDto(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 100, message = "Nome deve ter no maximo 100 caracteres")
        String nome,

        @NotBlank(message = "Tipo e obrigatorio")
        @Size(max = 50, message = "Tipo deve ter no maximo 50 caracteres")
        String tipo,

        @NotNull(message = "Preco e obrigatorio")
        @DecimalMin(value = "0.00", inclusive = false, message = "Preco deve ser maior que zero")
        @Digits(integer = 8, fraction = 2, message = "Preco deve ter no maximo 8 digitos inteiros e 2 decimais")
        BigDecimal preco,

        @NotNull(message = "Duracao e obrigatoria")
        @Min(value = 15, message = "Duracao deve ser de no minimo 15 minutos")
        @Max(value = 480, message = "Duracao deve ser de no maximo 480 minutos")
        Integer duracaoMinutos,

        @NotNull(message = "Ativo e obrigatorio")
        Boolean ativo
) {
}
