package com.fisasaude.projeto.sitema_agendamento.repository;

import com.fisasaude.projeto.sitema_agendamento.model.Estabelecimento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstabelecimentoRepository extends JpaRepository<Estabelecimento, Integer> {
}

