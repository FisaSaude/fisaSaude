package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidade que representa um prontuário médico de um cliente.
 * Um prontuário está associado a um cliente e a um agendamento.
 */
@Entity
@Table(name = "prontuario")
public class Prontuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String observacoes;

    @Column(nullable = false, name = "criado_em")
    private LocalDateTime criadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agendamento_id", nullable = false)
    private Agendamento agendamento;

    // Construtor padrão
    public Prontuario() {}

    // Construtor completo
    public Prontuario(Integer id, String observacoes, LocalDateTime criadoEm, Cliente cliente, Agendamento agendamento) {
        this.id = id;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm;
        this.cliente = cliente;
        this.agendamento = agendamento;
    }

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Agendamento getAgendamento() { return agendamento; }
    public void setAgendamento(Agendamento agendamento) { this.agendamento = agendamento; }

    // toString
    @Override
    public String toString() {
        return "Prontuario{" +
                "id=" + id +
                ", observacoes='" + observacoes + '\'' +
                ", criadoEm=" + criadoEm +
                ", cliente=" + (cliente != null ? cliente.getId() : null) +
                ", agendamento=" + (agendamento != null ? agendamento.getId() : null) +
                '}';
    }
}

