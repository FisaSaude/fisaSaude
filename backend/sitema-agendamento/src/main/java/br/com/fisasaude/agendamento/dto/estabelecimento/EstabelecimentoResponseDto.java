package br.com.fisasaude.agendamento.dto.estabelecimento;

import java.time.LocalDateTime;
import java.time.LocalTime;

public record EstabelecimentoResponseDto(
        Integer id,
        String nome,
        String endereco,
        String parametros,
        LocalTime inicioFuncionamento,
        LocalTime fimFuncionamento,
        String telefone,
        LocalDateTime criadoEm
) {
}

