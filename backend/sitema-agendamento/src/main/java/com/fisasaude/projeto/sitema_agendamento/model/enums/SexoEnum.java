package com.fisasaude.projeto.sitema_agendamento.model.enums;


/**
 * Enum que representa o sexo de um cliente.
 * Valores: M (Masculino), F (Feminino), OUTRO
 */
public enum SexoEnum {
    M("Masculino"),
    F("Feminino"),
    OUTRO("Outro");

    private final String descricao;

    SexoEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}

