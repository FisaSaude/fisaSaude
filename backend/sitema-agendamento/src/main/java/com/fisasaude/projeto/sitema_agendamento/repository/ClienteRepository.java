package com.fisasaude.projeto.sitema_agendamento.repository;

import com.fisasaude.projeto.sitema_agendamento.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {
    boolean existsByTelefone(String telefone);

    boolean existsByTelefoneAndIdNot(String telefone, Integer id);
}
