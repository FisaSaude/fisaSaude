package br.com.fisasaude.agendamento.repository;

import br.com.fisasaude.agendamento.model.entity.Prontuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProntuarioRepository extends JpaRepository<Prontuario, Integer> {
}

