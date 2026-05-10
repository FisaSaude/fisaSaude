package br.com.fisasaude.agendamento.model.entity;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "estabelecimento")
public class Estabelecimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, length = 255)
    private String endereco;

    @Column(length = 255)
    private String parametros;

    @Column(nullable = false)
    private LocalTime inicioFuncionamento;

    @Column(nullable = false)
    private LocalTime fimFuncionamento;

    @Column(length = 20)
    private String telefone;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    public Estabelecimento() {}

    public Estabelecimento(Integer id, String nome, String endereco, String parametros, LocalTime inicioFuncionamento, LocalTime fimFuncionamento, List<Usuario> usuarios, List<Despesa> despesas) {
        this.id = id;
        this.nome = nome;
        this.endereco = endereco;
        this.parametros = parametros;
        this.inicioFuncionamento = inicioFuncionamento;
        this.fimFuncionamento = fimFuncionamento;
        this.usuarios = usuarios != null ? usuarios : new ArrayList<>();
        this.despesas = despesas != null ? despesas : new ArrayList<>();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEndereco() { return endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }

    public String getParametros() { return parametros; }
    public void setParametros(String parametros) { this.parametros = parametros; }

    public LocalTime getInicioFuncionamento() { return inicioFuncionamento; }
    public void setInicioFuncionamento(LocalTime inicioFuncionamento) { this.inicioFuncionamento = inicioFuncionamento; }

    public LocalTime getFimFuncionamento() {
        return fimFuncionamento;
    }

    public void setFimFuncionamento(LocalTime fimFuncionamento) {
        this.fimFuncionamento = fimFuncionamento;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }

    @PrePersist
    void prePersistEstabelecimento() {
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    public List<Usuario> getUsuarios() {
        return usuarios;
    }

    public void setUsuarios(List<Usuario> usuarios) {
        this.usuarios = usuarios;
    }

    public List<Despesa> getDespesas() {
        return despesas;
    }

    public void setDespesas(List<Despesa> despesas) {
        this.despesas = despesas;
    }

    @Override
    public String toString() {
        return "Estabelecimento{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", endereco='" + endereco + '\'' +
                ", parametros='" + parametros + '\'' +
                ", inicioFuncionamento=" + inicioFuncionamento +
                ", fimFuncionamento=" + fimFuncionamento +
                '}';
    }
    @OneToMany(mappedBy = "estabelecimento", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Usuario> usuarios = new ArrayList<>();

    @OneToMany(mappedBy = "estabelecimento", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Despesa> despesas = new ArrayList<>();
}

