package school.sptech.projetoindividual.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import school.sptech.projetoindividual.model.TipoNoticia;

import java.util.List;

@Repository
public class TipoNoticiaRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<TipoNoticia> buscarTiposNoticia(){
        String sql = "SELECT * FROM tipoNoticia";

        List<TipoNoticia> respostaRepository = jdbcTemplate.query(sql, (rs, rowNum) -> {
            TipoNoticia tipoNoticia = new TipoNoticia();

            tipoNoticia.setId(rs.getLong("id"));
            tipoNoticia.setTipoNoticia(rs.getString("nome"));

            return tipoNoticia;
        });

        return respostaRepository;
    }
}
