package br.com.fisasaude.agendamento.model.entity;

import br.com.fisasaude.agendamento.model.enums.StatusAgendamentoEnum;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    public Agendamento() {}

    public Agendamento(Integer id, LocalDate data, LocalTime horaInicio, LocalTime horaFim, StatusAgendamentoEnum status, LocalDateTime criadoEm, LocalDateTime atualizadoEm, String observacoes, Cliente cliente, Servico servico, Usuario usuario, List<Notificacao> notificacoes, List<Prontuario> prontuarios) {
        this.id = id;
        this.data = data;
        this.horaInicio = horaInicio;
        this.horaFim = horaFim;
        this.status = status;
        this.criadoEm = criadoEm;
        this.atualizadoEm = atualizadoEm;
        this.observacoes = observacoes;
        this.cliente = cliente;
        this.servico = servico;
        this.usuario = usuario;
        this.notificacoes = notificacoes != null ? notificacoes : new ArrayList<>();
    }

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

    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }

    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }

    public Servico getServico() { return servico; }
    public void setServico(Servico servico) { this.servico = servico; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public List<Notificacao> getNotificacoes() { return notificacoes; }
    public void setNotificacoes(List<Notificacao> notificacoes) { this.notificacoes = notificacoes; }

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
                ", observacoes=" + observacoes +
                ", cliente=" + (cliente != null ? cliente.getId() : null) +
                ", servico=" + (servico != null ? servico.getId() : null) +
                ", usuario=" + (usuario != null ? usuario.getId() : null) +
                '}';
    }
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id")
    private Servico servico;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @OneToMany(mappedBy = "agendamento", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Notificacao> notificacoes = new ArrayList<>();

}

