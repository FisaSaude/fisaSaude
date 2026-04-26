package com.fisasaude.projeto.sitema_agendamento.dto.agendamento;

public record AgendamentoResumoPeriodoResponseDto(
        long concluidos,
        long remarcados,
        long cancelados,
        long total
) {
}

