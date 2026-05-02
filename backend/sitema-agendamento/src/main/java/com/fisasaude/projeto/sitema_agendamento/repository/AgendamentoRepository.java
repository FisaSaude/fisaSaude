package com.fisasaude.projeto.sitema_agendamento.repository;

import com.fisasaude.projeto.sitema_agendamento.model.entity.Agendamento;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusAgendamentoEnum;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AgendamentoRepository extends JpaRepository<Agendamento, Integer> {

    long countByDataBetweenAndStatus(LocalDate dataInicio, LocalDate dataFim, StatusAgendamentoEnum status);

    @Query("""
            SELECT DISTINCT a FROM Agendamento a
            JOIN FETCH a.cliente
            JOIN FETCH a.servico
            JOIN FETCH a.usuario
            WHERE a.status = :status AND a.data BETWEEN :inicio AND :fim
            ORDER BY a.data ASC, a.horaInicio ASC
            """)
    List<Agendamento> findByStatusAndDataBetweenOrderByDataAscHoraInicioAsc(
            @Param("status") StatusAgendamentoEnum status,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim
    );

    @Query("""
            SELECT DISTINCT a FROM Agendamento a
            JOIN FETCH a.cliente
            JOIN FETCH a.servico
            JOIN FETCH a.usuario
            WHERE a.cliente.id = :clienteId
            ORDER BY a.data DESC, a.horaInicio DESC
            """)
    List<Agendamento> findByClienteIdWithDetails(@Param("clienteId") Integer clienteId);

    @Query("""
            SELECT COUNT(a.id) FROM Agendamento a
            WHERE a.usuario.id = :usuarioId
            AND a.data = :data
            AND a.status <> :statusCancelado
            AND (:excludeId IS NULL OR a.id <> :excludeId)
            AND a.horaInicio < :horaFim AND a.horaFim > :horaInicio
            """)
    long countAgendamentosConflitantes(
            @Param("usuarioId") Integer usuarioId,
            @Param("data") LocalDate data,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFim") LocalTime horaFim,
            @Param("excludeId") Integer excludeId,
            @Param("statusCancelado") StatusAgendamentoEnum statusCancelado
    );

    @Query("""
            SELECT DISTINCT a FROM Agendamento a
            JOIN FETCH a.cliente
            JOIN FETCH a.servico
            JOIN FETCH a.usuario
            WHERE a.data = :data AND a.status = :status
            ORDER BY a.horaInicio ASC
            """)
    List<Agendamento> findAgendamentosParaLembrete(
            @Param("data") LocalDate data,
            @Param("status") StatusAgendamentoEnum status
    );

    @Query("""
            SELECT DISTINCT a FROM Agendamento a
            JOIN FETCH a.cliente
            JOIN FETCH a.servico
            JOIN FETCH a.usuario
            WHERE a.id = :id
            """)
    Optional<Agendamento> findByIdWithRelations(@Param("id") Integer id);

    @Query("""
            SELECT DISTINCT a FROM Agendamento a
            JOIN FETCH a.cliente c
            JOIN FETCH a.servico s
            JOIN FETCH a.usuario u
            WHERE c.id = :clienteId AND a.status = :status AND a.data >= :hojeMinimal
            ORDER BY a.data ASC, a.horaInicio ASC
            """)
    List<Agendamento> findByClienteFuturoOuHojeMesmoEstado(@Param("clienteId") Integer clienteId,
            @Param("status") StatusAgendamentoEnum status,
            @Param("hojeMinimal") LocalDate hojeMinimal);
}
