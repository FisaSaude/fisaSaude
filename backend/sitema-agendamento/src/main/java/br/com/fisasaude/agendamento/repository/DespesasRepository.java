package br.com.fisasaude.agendamento.repository;

import br.com.fisasaude.agendamento.model.entity.Despesas;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DespesasRepository extends JpaRepository<Despesas, Integer> {
}

