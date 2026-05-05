package br.com.fisasaude.agendamento.event;

/** Publicado apois commit de agendamento AGENDADO novo ou remarcado. */
public record AgendamentoNotificacaoConfirmacaoEvent(Integer agendamentoId) {}
