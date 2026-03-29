package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Entidade que representa uma notificação enviada ao cliente.
 * Uma notificação está associada a um agendamento.
 */
@Entity
@Table(name = "notificacao")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
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
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime enviadoEm;

    // ...existing code...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agendamento_id", nullable = false)
    private Agendamento agendamento;
}

