package com.fisasaude.projeto.sitema_agendamento.repository;

import com.fisasaude.projeto.sitema_agendamento.model.entity.Agendamento;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusAgendamentoEnum;
import java.time.LocalDate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

	long countByDataBetweenAndStatus(LocalDate dataInicio, LocalDate dataFim, StatusAgendamentoEnum status);
}

