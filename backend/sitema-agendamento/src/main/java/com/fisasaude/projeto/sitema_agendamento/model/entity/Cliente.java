package com.fisasaude.projeto.sitema_agendamento.model.entity;

import com.fisasaude.projeto.sitema_agendamento.model.enums.SexoEnum;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cliente")

public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "telefone_whatsapp", nullable = false, unique = true, length = 20)
    private String telefone;

    @Column(name = "whatsapp_ativo")
    private Boolean whatsappAtivo = Boolean.TRUE;

    @Column(nullable = false)
    private LocalDate dataNascimento;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private SexoEnum sexo;

    @Column(length = 255)
    private String fotoLink;

    public Cliente() {}

    public Cliente(Integer id, String nome, String telefone, Boolean whatsappAtivo, LocalDate dataNascimento, SexoEnum sexo, String fotoLink, List<Agendamento> agendamentos, List<Prontuario> prontuarios) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.whatsappAtivo = whatsappAtivo != null ? whatsappAtivo : Boolean.TRUE;
        this.dataNascimento = dataNascimento;
        this.sexo = sexo;
        this.fotoLink = fotoLink;
        this.agendamentos = agendamentos != null ? agendamentos : new ArrayList<>();
        this.prontuarios = prontuarios != null ? prontuarios : new ArrayList<>();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }

    public Boolean getWhatsappAtivo() { return whatsappAtivo; }
    public void setWhatsappAtivo(Boolean whatsappAtivo) {
        this.whatsappAtivo = whatsappAtivo != null ? whatsappAtivo : Boolean.TRUE;
    }

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

    @Override
    public String toString() {
        return "Cliente{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", telefone='" + telefone + '\'' +
                ", whatsappAtivo=" + whatsappAtivo +
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

