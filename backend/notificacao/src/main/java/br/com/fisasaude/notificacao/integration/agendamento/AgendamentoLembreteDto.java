package br.com.fisasaude.notificacao.integration.agendamento;

import java.time.LocalTime;

public record AgendamentoLembreteDto(Integer agendamentoId, String telefoneCliente, LocalTime horaInicio) {}
