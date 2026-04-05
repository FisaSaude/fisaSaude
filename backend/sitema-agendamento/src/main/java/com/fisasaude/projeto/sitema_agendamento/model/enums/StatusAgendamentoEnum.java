package com.fisasaude.projeto.sitema_agendamento.model.enums;


/**
 * Enum que representa os possíveis status de um agendamento.
 * Valores: AGENDADO, CANCELADO, CONCLUIDO
 */
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

    public String getDescricao() {
        return descricao;
    }
}

