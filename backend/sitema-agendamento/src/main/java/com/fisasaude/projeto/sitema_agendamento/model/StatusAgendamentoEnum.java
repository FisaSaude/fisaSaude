package com.fisasaude.projeto.sitema_agendamento.model;

import lombok.Getter;

/**
 * Enum que representa os possíveis status de um agendamento.
 * Valores: AGENDADO, CANCELADO, CONCLUIDO
 */
@Getter
public enum StatusAgendamentoEnum {
    AGENDADO("Agendado"),
    CANCELADO("Cancelado"),
    REMARCADO("Remarcado"),
    CONFIRMADO("Confirmado"),
    CONCLUIDO("Concluído");

    private final String descricao;

    StatusAgendamentoEnum(String descricao) {
        this.descricao = descricao;
    }
}

