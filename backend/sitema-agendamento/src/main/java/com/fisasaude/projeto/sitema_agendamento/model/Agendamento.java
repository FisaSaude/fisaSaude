package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Entidade que representa um agendamento de cliente com um serviço.
 * Um agendamento é criado por um usuário para um cliente em um horário específico.
 * UNIQUE: (data, hora_inicio, usuario_id) - Evita conflitos de agenda
 */
@Entity
@Table(name = "agendamento", 
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"data", "hora_inicio", "usuario_id"})
       })

public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private LocalDate data;

    @Column(nullable = false)
    private LocalTime horaInicio;

    @Column(nullable = false)
    private LocalTime horaFim;

    @Column(nullable = false, name = "status")
    @Enumerated(EnumType.STRING)
    private StatusAgendamentoEnum status;

    @Column(nullable = false)
    private LocalDateTime criadoEm;

    @Column(nullable = false)
    private LocalDateTime atualizadoEm;

    // ...existing code...

    // Construtor padrão
    public Agendamento() {}

    // Construtor completo
    public Agendamento(Integer id, LocalDate data, LocalTime horaInicio, LocalTime horaFim, StatusAgendamentoEnum status, LocalDateTime criadoEm, LocalDateTime atualizadoEm, Cliente cliente, Servico servico, Usuario usuario, List<Notificacao> notificacoes, List<Prontuario> prontuarios) {
        this.id = id;
        this.data = data;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.status = status;
        this.criadoEm = criadoEm;
        this.atualizadoEm = atualizadoEm;
        this.cliente = cliente;
        this.servico = servico;
        this.usuario = usuario;
        this.notificacoes = notificacoes != null ? notificacoes : new ArrayList<>();
        this.prontuarios = prontuarios != null ? prontuarios : new ArrayList<>();
    }

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public LocalTime getHoraInicio() { return horaInicio; }
    public void setHoraInicio(LocalTime horaInicio) { this.horaInicio = horaInicio; }

    public LocalTime getHoraFim() { return horaFim; }
    public void setHoraFim(LocalTime horaFim) { this.horaFim = horaFim; }

    public StatusAgendamentoEnum getStatus() { return status; }
    public void setStatus(StatusAgendamentoEnum status) { this.status = status; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public LocalDateTime getAtualizadoEm() { return atualizadoEm; }
    public void setAtualizadoEm(LocalDateTime atualizadoEm) { this.atualizadoEm = atualizadoEm; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public List<Notificacao> getNotificacoes() { return notificacoes; }
    public void setNotificacoes(List<Notificacao> notificacoes) { this.notificacoes = notificacoes; }

    public List<Prontuario> getProntuarios() { return prontuarios; }
    public void setProntuarios(List<Prontuario> prontuarios) { this.prontuarios = prontuarios; }

    // toString sem notificacoes e prontuarios
    @Override
    public String toString() {
        return "Agendamento{" +
                "id=" + id +
                ", data=" + data +
                ", horaInicio=" + horaInicio +
                ", horaFim=" + horaFim +
                ", status=" + status +
                ", criadoEm=" + criadoEm +
                ", atualizadoEm=" + atualizadoEm +
                ", cliente=" + (cliente != null ? cliente.getId() : null) +
                ", servico=" + (servico != null ? servico.getId() : null) +
                ", usuario=" + (usuario != null ? usuario.getId() : null) +
                '}';
    }
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id", nullable = false)
    private Servico servico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "agendamento", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notificacao> notificacoes = new ArrayList<>();

    @OneToMany(mappedBy = "agendamento", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Prontuario> prontuarios = new ArrayList<>();
}

