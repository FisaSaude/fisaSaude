package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Entidade que representa um cliente (paciente).
 * Um cliente pode ter múltiplos agendamentos e prontuários.
 */
@Entity
@Table(name = "cliente")
@Getter
@Setter
@ToString(exclude = {"agendamentos", "prontuarios"})
@NoArgsConstructor
@AllArgsConstructor
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, unique = true, length = 20)
    private String telefone;

    @Column(nullable = false)
    @Temporal(TemporalType.DATE)
    private LocalDate dataNascimento;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SexoEnum sexo;

    @Column(length = 255)
    private String fotoLink;

    // ...existing code...
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Agendamento> agendamentos = new ArrayList<>();

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Prontuario> prontuarios = new ArrayList<>();
}

