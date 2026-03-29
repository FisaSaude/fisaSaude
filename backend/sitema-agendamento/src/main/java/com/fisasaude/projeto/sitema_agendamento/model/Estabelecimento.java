package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
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
 * Entidade que representa um estabelecimento (clínica/consultório).
 * Um estabelecimento pode ter múltiplos usuários e despesas.
 */
@Entity
@Table(name = "estabelecimento")
@Getter
@Setter
@ToString(exclude = {"usuarios", "despesas"})
@NoArgsConstructor
@AllArgsConstructor
public class Estabelecimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 255)
    private String endereco;

    @Column(length = 255)
    private String parametros;

    @Column(nullable = false)
    @Temporal(TemporalType.TIME)
    private LocalTime inicioFuncionamento;

    @Column(nullable = false)
    @Temporal(TemporalType.TIME)
    private LocalTime fimFuncionamento;

    // ...existing code...
    @OneToMany(mappedBy = "estabelecimento", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Usuario> usuarios = new ArrayList<>();

    @OneToMany(mappedBy = "estabelecimento", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Despesas> despesas = new ArrayList<>();
}

