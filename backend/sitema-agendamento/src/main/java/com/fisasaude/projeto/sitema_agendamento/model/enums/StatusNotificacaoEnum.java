package com.fisasaude.projeto.sitema_agendamento.model.enums;


/**
 * Enum que representa os possíveis status de uma notificação.
 * Valores: PENDENTE, ENVIADO, FALHOU, DESCARTADA
 */
public enum StatusNotificacaoEnum {
    PENDENTE("Pendente"),
    ENVIADO("Enviado"),
    FALHOU("Falhou"),
    DESCARTADA("Descartada");

    private final String descricao;

    StatusNotificacaoEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}

