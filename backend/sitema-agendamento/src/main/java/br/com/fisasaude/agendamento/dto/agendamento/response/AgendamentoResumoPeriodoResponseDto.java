package br.com.fisasaude.agendamento.dto.agendamento.response;

public record AgendamentoResumoPeriodoResponseDto(
        long concluidos,
        long agendados,
        long cancelados,
        long total
) {
}

