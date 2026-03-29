package com.fisasaude.projeto.sitema_agendamento.model;

import lombok.Getter;

/**
 * Enum que representa os possíveis status de uma notificação.
 * Valores: PENDENTE, ENVIADO, FALHOU
 */
@Getter
public enum StatusNotificacaoEnum {
    PENDENTE("Pendente"),
    ENVIADO("Enviado"),
    FALHOU("Falhou");

    private final String descricao;

    StatusNotificacaoEnum(String descricao) {
        this.descricao = descricao;
    }
}

