package br.com.fisasaude.notificacao.repository;

import br.com.fisasaude.notificacao.model.entity.Agendamento;
import br.com.fisasaude.notificacao.model.enums.StatusAgendamentoEnum;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

    @Query(
            """
            SELECT DISTINCT a FROM Agendamento a
            JOIN FETCH a.cliente
            JOIN FETCH a.servico
            JOIN FETCH a.usuario
            WHERE a.data = :data AND a.status IN :statuses
            ORDER BY a.horaInicio ASC
            """)
    List<Agendamento> findAgendamentosParaLembreteStatusEm(
            @Param("data") LocalDate data, @Param("statuses") List<StatusAgendamentoEnum> statuses);

    @Query(
            """
            SELECT DISTINCT a FROM Agendamento a
            JOIN FETCH a.cliente
            JOIN FETCH a.servico
            JOIN FETCH a.usuario
            WHERE a.id = :id
            """)
    Optional<Agendamento> findByIdWithRelations(@Param("id") Integer id);

    @Query(
            """
            SELECT a FROM Agendamento a
            JOIN FETCH a.cliente
            JOIN FETCH a.servico
            JOIN FETCH a.usuario
            WHERE a.cliente.id = :clienteId
              AND a.status = :status
            ORDER BY a.data DESC, a.horaInicio DESC, a.id DESC
            """)
    List<Agendamento> findByClienteAndStatusOrderByMaisRecente(
            @Param("clienteId") Integer clienteId, @Param("status") StatusAgendamentoEnum status);

    @Query(
            """
            SELECT a FROM Agendamento a
            JOIN FETCH a.cliente
            JOIN FETCH a.servico
            JOIN FETCH a.usuario
            WHERE a.cliente.id IN :clienteIds
              AND a.status = :status
            ORDER BY a.data DESC, a.horaInicio DESC, a.id DESC
            """)
    List<Agendamento> findByClienteIdInAndStatusOrderByMaisRecente(
            @Param("clienteIds") List<Integer> clienteIds, @Param("status") StatusAgendamentoEnum status);
}
