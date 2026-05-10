package br.com.fisasaude.agendamento.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

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


    public Prontuario() {}

    public Prontuario(Integer id, String observacoes, LocalDateTime criadoEm, Cliente cliente) {
        this.id = id;
        this.observacoes = observacoes;
        this.criadoEm = criadoEm;
        this.cliente = cliente;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }


    @Override
    public String toString() {
        return "Prontuario{" +
                "id=" + id +
                ", observacoes='" + observacoes + '\'' +
                ", criadoEm=" + criadoEm +
                ", cliente=" + (cliente != null ? cliente.getId() : null) +
                '}';
    }
}

