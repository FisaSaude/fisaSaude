package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Entidade que representa um serviço oferecido pelo estabelecimento.
 * Um serviço pode estar associado a múltiplos agendamentos.
 */
@Entity
@Table(name = "servico")
@Getter
@Setter
@ToString(exclude = {"agendamentos"})
@NoArgsConstructor
@AllArgsConstructor
public class Servico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 45)
    private String tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal preco;

    // ...existing code...
    @OneToMany(mappedBy = "servico", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Agendamento> agendamentos = new ArrayList<>();
}

