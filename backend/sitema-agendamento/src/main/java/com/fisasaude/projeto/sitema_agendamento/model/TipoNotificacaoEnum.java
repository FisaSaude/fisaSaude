package com.fisasaude.projeto.sitema_agendamento.model;

import lombok.Getter;

/**
 * Enum que representa os tipos de notificação.
 * Valores: LEMBRETE, CONFIRMACAO, CANCELAMENTO
 */
@Getter
public enum TipoNotificacaoEnum {
    LEMBRETE("Lembrete"),
    CONFIRMACAO("Confirmação"),
    CANCELAMENTO("Cancelamento");

    private final String descricao;

    TipoNotificacaoEnum(String descricao) {
        this.descricao = descricao;
    }
}

