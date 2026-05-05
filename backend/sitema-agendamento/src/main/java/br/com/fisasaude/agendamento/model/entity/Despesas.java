package br.com.fisasaude.agendamento.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "despesas")
public class Despesas {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false)
    private LocalDate dataDespesa;

    @Column(nullable = false, length = 45)
    private String tipo;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal valor;

    public Despesas() {}

    public Despesas(Integer id, String nome, LocalDate dataDespesa, String tipo, BigDecimal valor, Estabelecimento estabelecimento) {
        this.id = id;
        this.nome = nome;
        this.dataDespesa = dataDespesa;
        this.tipo = tipo;
        this.valor = valor;
        this.estabelecimento = estabelecimento;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public LocalDate getDataDespesa() { return dataDespesa; }
    public void setDataDespesa(LocalDate dataDespesa) { this.dataDespesa = dataDespesa; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public BigDecimal getValor() { return valor; }
    public void setValor(BigDecimal valor) { this.valor = valor; }

    public Estabelecimento getEstabelecimento() { return estabelecimento; }
    public void setEstabelecimento(Estabelecimento estabelecimento) { this.estabelecimento = estabelecimento; }

    @Override
    public String toString() {
        return "Despesas{" +
                "id=" + id +
                ", nome='" + nome + '\'' +
                ", dataDespesa=" + dataDespesa +
                ", tipo='" + tipo + '\'' +
                ", valor=" + valor +
                ", estabelecimento=" + (estabelecimento != null ? estabelecimento.getId() : null) +
                '}';
    }
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "estabelecimento_id", nullable = false)
    private Estabelecimento estabelecimento;
}

