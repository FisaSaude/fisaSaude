package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

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
@Getter
@Setter
@ToString(exclude = {"notificacoes", "prontuarios"})
@NoArgsConstructor
@AllArgsConstructor
public class Agendamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    @Temporal(TemporalType.DATE)
    private LocalDate data;

    @Column(nullable = false)
    @Temporal(TemporalType.TIME)
    private LocalTime horaInicio;

    @Column(nullable = false)
    @Temporal(TemporalType.TIME)
    private LocalTime horaFim;

    @Column(nullable = false, name = "status")
    @Enumerated(EnumType.STRING)
    private StatusAgendamentoEnum status;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime criadoEm;

    @Column(nullable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime atualizadoEm;

    // ...existing code...
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

