package br.com.fisasaude.agendamento.dto.estabelecimento;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalTime;

public record EstabelecimentoCreateRequestDto(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 150, message = "Nome deve ter no maximo 150 caracteres")
        String nome,

        @NotBlank(message = "Endereco e obrigatorio")
        @Size(max = 255, message = "Endereco deve ter no maximo 255 caracteres")
        String endereco,

        @Size(max = 255, message = "Parametros deve ter no maximo 255 caracteres")
        String parametros,

        @NotNull(message = "inicioFuncionamento e obrigatorio")
        LocalTime inicioFuncionamento,

        @NotNull(message = "fimFuncionamento e obrigatorio")
        LocalTime fimFuncionamento,

        @Size(max = 20, message = "Telefone deve ter no maximo 20 caracteres")
        String telefone
) {
}

