package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Entidade que representa uma despesa de um estabelecimento.
 * Uma despesa pertence a um estabelecimento.
 */
@Entity
@Table(name = "despesas")
@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class Despesas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false)
    @Temporal(TemporalType.DATE)
    private LocalDate dataDespesa;

    @Column(nullable = false, length = 45)
    private String tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    // ...existing code...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estabelecimento_id", nullable = false)
    private Estabelecimento estabelecimento;
}

