package com.fisasaude.projeto.sitema_agendamento.repository;

import com.fisasaude.projeto.sitema_agendamento.model.Servico;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ServicoRepository extends JpaRepository<Servico, Integer> {
}

