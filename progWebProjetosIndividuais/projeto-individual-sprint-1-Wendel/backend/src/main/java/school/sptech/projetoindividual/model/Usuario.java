package school.sptech.projetoindividual.model;
import java.sql.Date;

public class Usuario {
    // Tabela Real
    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private Date dtNascimento;
    private String frequenciaRecebimento;
    private Boolean aceitaPublicidade;
    private Boolean aceitaWhatsapp;
    private Long tipoFavorito;

    // Selects
    private String tipoFavoritoNome;

    public Usuario() {}

    public Usuario(Long id, String nome, String email, String telefone, Date dtNascimento, String frequenciaRecebimento, Boolean aceitaPublicidade, Boolean aceitaWhatsapp, Long tipoFavorito, String tipoFavotito) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.dtNascimento = dtNascimento;
        this.frequenciaRecebimento = frequenciaRecebimento;
        this.aceitaPublicidade = aceitaPublicidade;
        this.aceitaWhatsapp = aceitaWhatsapp;
        this.tipoFavorito = tipoFavorito;
        this.tipoFavoritoNome = tipoFavotito;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public Date getDtNascimento() {
        return dtNascimento;
    }

    public void setDtNascimento(Date dtNascimento) {
        this.dtNascimento = dtNascimento;
    }

    public String getFrequenciaRecebimento() {
        return frequenciaRecebimento;
    }

    public void setFrequenciaRecebimento(String frequenciaRecebimento) {
        this.frequenciaRecebimento = frequenciaRecebimento;
    }

    public Boolean getAceitaPublicidade() {
        return aceitaPublicidade;
    }

    public void setAceitaPublicidade(Boolean aceitaPublicidade) {
        this.aceitaPublicidade = aceitaPublicidade;
    }

    public Boolean getAceitaWhatsapp() {
        return aceitaWhatsapp;
    }

    public void setAceitaWhatsapp(Boolean aceitaWhatsapp) {
        this.aceitaWhatsapp = aceitaWhatsapp;
    }

    public Long getTipoFavorito() {
        return tipoFavorito;
    }

    public void setTipoFavorito(Long tipoFavorito) {
        this.tipoFavorito = tipoFavorito;
    }

    public String getTipoFavoritoNome() {
        return tipoFavoritoNome;
    }

    public void setTipoFavoritoNome(String tipoFavoritoNome) {
        this.tipoFavoritoNome = tipoFavoritoNome;
    }
}
