package br.com.fisasaude.notificacao.model.enums;

public enum StatusAgendamentoEnum {
    AGENDADO("Agendado"),
    CONFIRMADO("Confirmado pelo paciente"),
    CANCELADO("Cancelado"),
    CONCLUIDO("Concluído");

    private final String descricao;

    StatusAgendamentoEnum(String descricao) {
        this.descricao = descricao;
    }

    public String getDescricao() {
        return descricao;
    }
}
