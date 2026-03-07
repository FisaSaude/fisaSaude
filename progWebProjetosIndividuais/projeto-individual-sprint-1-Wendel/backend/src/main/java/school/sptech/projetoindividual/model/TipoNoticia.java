package school.sptech.projetoindividual.model;

public class TipoNoticia {
    private Long id;
    private String TipoNoticia;

    public TipoNoticia() {}

    public TipoNoticia(Long id, String tipoNoticia) {
        this.id = id;
        TipoNoticia = tipoNoticia;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipoNoticia() {
        return TipoNoticia;
    }

    public void setTipoNoticia(String tipoNoticia) {
        TipoNoticia = tipoNoticia;
    }
}
