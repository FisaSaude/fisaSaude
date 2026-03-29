package com.fisasaude.projeto.sitema_agendamento.repository;

import com.fisasaude.projeto.sitema_agendamento.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {
}

