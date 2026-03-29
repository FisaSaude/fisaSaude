package com.fisasaude.projeto.sitema_agendamento.repository;

import com.fisasaude.projeto.sitema_agendamento.model.Despesas;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DespesasRepository extends JpaRepository<Despesas, Integer> {
}

