package school.sptech.projetoindividual.model.dto;

public class TipoNoticiaResponseDTO {
    private Long id;
    private String tipoNoticia;

    public TipoNoticiaResponseDTO() {}

    public TipoNoticiaResponseDTO(Long id, String tipoNoticia) {
        this.id = id;
        tipoNoticia = tipoNoticia;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipoNoticia() {
        return tipoNoticia;
    }

    public void setTipoNoticia(String tipoNoticia) {
        this.tipoNoticia = tipoNoticia;
    }
}
