package com.fisasaude.projeto.sitema_agendamento.model.enums;


/**
 * Enum que representa os tipos de notificação.
 * Valores: LEMBRETE, CONFIRMACAO, CANCELAMENTO
 */
public enum TipoNotificacaoEnum {
    LEMBRETE("Lembrete"),
    CONFIRMACAO("Confirmação"),
    CANCELAMENTO("Cancelamento");

    private final String descricao;

    TipoNotificacaoEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}

