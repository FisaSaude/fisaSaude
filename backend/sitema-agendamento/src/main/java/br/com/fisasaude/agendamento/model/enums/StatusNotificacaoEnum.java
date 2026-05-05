package br.com.fisasaude.agendamento.model.enums;

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

