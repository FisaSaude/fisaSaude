package com.fisasaude.projeto.sitema_agendamento.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

/**
 * Entidade que representa um cliente (paciente).
 * Um cliente pode ter múltiplos agendamentos e prontuários.
 */
@Entity
@Table(name = "cliente")

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

    // Construtor padrão
    public Cliente() {}

    // Construtor completo
    public Cliente(Integer id, String nome, String telefone, LocalDate dataNascimento, SexoEnum sexo, String fotoLink, List<Agendamento> agendamentos, List<Prontuario> prontuarios) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.dataNascimento = dataNascimento;
        this.sexo = sexo;
        this.fotoLink = fotoLink;
        this.agendamentos = agendamentos != null ? agendamentos : new ArrayList<>();
        this.prontuarios = prontuarios != null ? prontuarios : new ArrayList<>();
    }

    // Getters e Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public SexoEnum getSexo() { return sexo; }
    public void setSexo(SexoEnum sexo) { this.sexo = sexo; }

    public String getFotoLink() { return fotoLink; }
    public void setFotoLink(String fotoLink) { this.fotoLink = fotoLink; }

    public List<Agendamento> getAgendamentos() { return agendamentos; }
    public void setAgendamentos(List<Agendamento> agendamentos) { this.agendamentos = agendamentos; }

    public List<Prontuario> getProntuarios() { return prontuarios; }
    public void setProntuarios(List<Prontuario> prontuarios) { this.prontuarios = prontuarios; }

    // toString sem agendamentos e prontuarios
    @Override
    public String toString() {
        return "Cliente{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", telefone='" + telefone + '\'' +
                ", dataNascimento=" + dataNascimento +
                ", sexo=" + sexo +
                ", fotoLink='" + fotoLink + '\'' +
                '}';
    }
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Agendamento> agendamentos = new ArrayList<>();

    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Prontuario> prontuarios = new ArrayList<>();
}

