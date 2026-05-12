package br.com.fisasaude.agendamento.repository;

import br.com.fisasaude.agendamento.model.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    boolean existsByTelefone(String telefone);

    boolean existsByTelefoneAndIdNot(String telefone, Integer id);

}
