package br.com.fisasaude.agendamento.repository;

import br.com.fisasaude.agendamento.model.entity.Servico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<Servico, Integer> {
}

