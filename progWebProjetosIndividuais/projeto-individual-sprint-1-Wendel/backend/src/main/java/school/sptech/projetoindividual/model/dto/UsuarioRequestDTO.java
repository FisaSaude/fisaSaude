package school.sptech.projetoindividual.model.dto;

import java.sql.Date;

public class UsuarioRequestDTO {
    private String nome;
    private String email;
    private String telefone;
    private Date dtNascimento;
    private String frequenciaRecebimento;
    private Boolean aceitaPublicidade;
    private Boolean aceitaWhatsapp;
    private Long tipoFavoritoId;

    public UsuarioRequestDTO() {}

    public UsuarioRequestDTO(String nome, String email, String telefone, Date dtNascimento, String frequenciaRecebimento, Boolean aceitaPublicidade, Boolean aceitaWhatsapp, Long tipoFavoritoId) {
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.dtNascimento = dtNascimento;
        this.frequenciaRecebimento = frequenciaRecebimento;
        this.aceitaPublicidade = aceitaPublicidade;
        this.aceitaWhatsapp = aceitaWhatsapp;
        this.tipoFavoritoId = tipoFavoritoId;
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

    public Long getTipoFavoritoId() {
        return tipoFavoritoId;
    }

    public void setTipoFavoritoId(Long tipoFavoritoId) {
        this.tipoFavoritoId = tipoFavoritoId;
    }
}
