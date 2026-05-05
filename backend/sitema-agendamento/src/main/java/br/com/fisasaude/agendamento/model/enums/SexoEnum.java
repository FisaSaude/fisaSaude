package br.com.fisasaude.agendamento.model.enums;

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

