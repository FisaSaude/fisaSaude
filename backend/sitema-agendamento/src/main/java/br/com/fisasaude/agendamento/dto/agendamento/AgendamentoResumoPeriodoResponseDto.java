package br.com.fisasaude.agendamento.dto.agendamento;

public record AgendamentoResumoPeriodoResponseDto(
        long concluidos,
        long agendados,
        long cancelados,
        long total
) {
}

