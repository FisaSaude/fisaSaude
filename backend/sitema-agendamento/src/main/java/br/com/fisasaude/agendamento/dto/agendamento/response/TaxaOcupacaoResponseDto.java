package br.com.fisasaude.agendamento.dto.agendamento.response;

import java.time.LocalDate;

public record TaxaOcupacaoResponseDto(
        LocalDate dataInicio,
        LocalDate dataFim,
        int duracaoSlotMinutos,
        long totalAgendamentos,
        long capacidadeMaxima,
        double taxaOcupacaoPercent
) {
}

