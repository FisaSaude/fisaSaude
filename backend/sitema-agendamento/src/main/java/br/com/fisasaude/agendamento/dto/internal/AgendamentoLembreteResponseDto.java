package br.com.fisasaude.agendamento.dto.internal;

import java.time.LocalTime;

public record AgendamentoLembreteResponseDto(
        Integer agendamentoId,
        String telefoneCliente,
        LocalTime horaInicio) {}
