package br.com.fisasaude.agendamento.repository;

import br.com.fisasaude.agendamento.model.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    boolean existsByEmail(String email);
    UserDetails findByEmail(String email);
    boolean existsByEmailAndIdNot(String email, Integer id);
}
