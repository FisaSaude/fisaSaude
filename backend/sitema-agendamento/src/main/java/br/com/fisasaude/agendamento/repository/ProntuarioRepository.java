package br.com.fisasaude.agendamento.repository;

import br.com.fisasaude.agendamento.model.entity.Prontuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProntuarioRepository extends JpaRepository<Prontuario, Integer> {
	List<Prontuario> findByClienteId(Integer clienteId);
}

