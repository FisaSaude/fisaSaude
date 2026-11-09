package br.com.fisasaude.agendamento.dto.servico;

import java.math.BigDecimal;

public record ServicoResponseDto(
        Integer id,
        String nome,
        String tipo,
        BigDecimal preco,
        Integer duracaoMinutos,
        Boolean ativo
) {
}
