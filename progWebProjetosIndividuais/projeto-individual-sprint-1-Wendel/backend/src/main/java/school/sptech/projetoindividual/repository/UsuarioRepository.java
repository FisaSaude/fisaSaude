package school.sptech.projetoindividual.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;
import school.sptech.projetoindividual.model.Usuario;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class UsuarioRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public Usuario buscarId(Long id){
        String sql = """
                SELECT u.nome, u.email, u.telefone, u.dtNascimento, u.frequenciaRecebimento,
                u.aceitaPublicidade, aceitaWhatsapp, t.nome as tipoNoticia
                FROM usuario u
                JOIN tipoNoticia t ON u.tipoFavorito = t.id
                WHERE u.id = ?
                """;


        List<Usuario> respostaRepository = jdbcTemplate.query(sql,
                (rs, rowNum) -> {

            Usuario usuario = new Usuario();
            usuario.setNome(rs.getString("nome"));
            usuario.setEmail(rs.getString("email"));
            usuario.setTelefone(rs.getString("telefone"));
            usuario.setDtNascimento(rs.getDate("dtNascimento"));
            usuario.setFrequenciaRecebimento(rs.getString("frequenciaRecebimento"));
            usuario.setAceitaPublicidade(rs.getBoolean("aceitaPublicidade"));
            usuario.setAceitaWhatsapp(rs.getBoolean("aceitaWhatsapp"));
            usuario.setTipoFavoritoNome(rs.getString("tipoNoticia"));
            return usuario;
        }, id);

        return respostaRepository.stream().findFirst().orElse(null);
    }

    public Long save(Usuario usuario){
        String sql = """
                INSERT IGNORE usuario (
                    nome,
                    email,
                    telefone,
                    dtNascimento,
                    frequenciaRecebimento,
                    aceitaPublicidade,
                    aceitaWhatsapp,
                    tipoFavorito
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;
        KeyHolder idCriado = new GeneratedKeyHolder();

        jdbcTemplate.update(con -> {
        PreparedStatement ps = con.prepareStatement(
                sql,
                Statement.RETURN_GENERATED_KEYS
        );
            ps.setString(1, usuario.getNome());
            ps.setString(2, usuario.getEmail());
            ps.setString(3, usuario.getTelefone());
            ps.setDate(4, usuario.getDtNascimento());
            ps.setString(5, usuario.getFrequenciaRecebimento());
            ps.setBoolean(6, usuario.getAceitaPublicidade());
            ps.setBoolean(7, usuario.getAceitaWhatsapp());
            ps.setLong(8, usuario.getTipoFavorito());

            return ps;
        }, idCriado);

        return idCriado.getKey().longValue();
    }

}
