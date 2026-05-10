package br.com.fisasaude.agendamento.repository;

import br.com.fisasaude.agendamento.model.entity.Despesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DespesaRepository extends JpaRepository<Despesa, Integer> {
    List<Despesa> findByEstabelecimentoId(Integer estabelecimentoId);
    List<Despesa> findByEstabelecimentoIdAndDataDespesaBetween(Integer estabelecimentoId, java.time.LocalDate dataInicio, java.time.LocalDate dataFim);
}
