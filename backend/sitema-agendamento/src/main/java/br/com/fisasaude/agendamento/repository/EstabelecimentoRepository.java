package br.com.fisasaude.agendamento.repository;

import br.com.fisasaude.agendamento.model.entity.Estabelecimento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EstabelecimentoRepository extends JpaRepository<Estabelecimento, Integer> {
}

