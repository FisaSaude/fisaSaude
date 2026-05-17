package br.com.fisasaude.agendamento.dto.despesa;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DespesaResponseDto(
    Integer id,
    String nome,
    LocalDate dataDespesa,
    String tipo,
    BigDecimal valor,
    Integer estabelecimentoId
) {}

