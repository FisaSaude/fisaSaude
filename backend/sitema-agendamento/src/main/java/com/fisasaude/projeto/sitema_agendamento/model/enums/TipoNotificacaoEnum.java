package com.fisasaude.projeto.sitema_agendamento.model.enums;

public enum TipoNotificacaoEnum {
    LEMBRETE("Lembrete"),
    CONFIRMACAO("Confirmação"),
    CANCELAMENTO("Cancelamento"),
    REAGENDAMENTO("Reagendamento");

    private final String descricao;

    TipoNotificacaoEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}

