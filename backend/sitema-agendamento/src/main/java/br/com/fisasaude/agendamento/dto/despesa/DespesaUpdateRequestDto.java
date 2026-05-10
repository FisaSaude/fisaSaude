package br.com.fisasaude.agendamento.dto.despesa;

import br.com.fisasaude.agendamento.model.enums.TipoDespesaEnum;
import java.math.BigDecimal;
import java.time.LocalDate;

public record DespesaUpdateRequestDto(
    String nome,
    LocalDate dataDespesa,
    TipoDespesaEnum tipo,
    BigDecimal valor,
    Integer estabelecimentoId
) {}

