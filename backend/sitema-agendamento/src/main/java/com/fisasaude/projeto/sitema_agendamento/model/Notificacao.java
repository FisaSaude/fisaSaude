package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidade que representa uma notificação enviada ao cliente.
 * Uma notificação está associada a um agendamento.
 */
@Entity
@Table(name = "notificacao")
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoNotificacaoEnum tipo;

    @Column(nullable = false, name = "status")
    @Enumerated(EnumType.STRING)
    private StatusNotificacaoEnum status;

    @Column(name = "enviado_em")
    private LocalDateTime enviadoEm;

    // ...existing code...

    // Construtor padrão
    public Notificacao() {}

    // Construtor completo
    public Notificacao(Integer id, TipoNotificacaoEnum tipo, StatusNotificacaoEnum status, LocalDateTime enviadoEm, Agendamento agendamento) {
        this.id = id;
        this.tipo = tipo;
        this.status = status;
        this.enviadoEm = enviadoEm;
        this.agendamento = agendamento;
    }

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public TipoNotificacaoEnum getTipo() { return tipo; }
    public void setTipo(TipoNotificacaoEnum tipo) { this.tipo = tipo; }

    public StatusNotificacaoEnum getStatus() { return status; }
    public void setStatus(StatusNotificacaoEnum status) { this.status = status; }

    public LocalDateTime getEnviadoEm() { return enviadoEm; }
    public void setEnviadoEm(LocalDateTime enviadoEm) { this.enviadoEm = enviadoEm; }

    public Agendamento getAgendamento() { return agendamento; }
    public void setAgendamento(Agendamento agendamento) { this.agendamento = agendamento; }

    // toString
    @Override
    public String toString() {
        return "Notificacao{" +
                "id=" + id +
                ", tipo=" + tipo +
                ", status=" + status +
                ", enviadoEm=" + enviadoEm +
                ", agendamento=" + (agendamento != null ? agendamento.getId() : null) +
                '}';
    }
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agendamento_id", nullable = false)
    private Agendamento agendamento;
}

