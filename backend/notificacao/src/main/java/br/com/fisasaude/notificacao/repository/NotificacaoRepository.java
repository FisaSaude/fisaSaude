package br.com.fisasaude.notificacao.repository;

import br.com.fisasaude.notificacao.model.entity.Notificacao;
import br.com.fisasaude.notificacao.model.enums.StatusNotificacaoEnum;
import br.com.fisasaude.notificacao.model.enums.TipoNotificacaoEnum;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Integer> {

    boolean existsByAgendamento_IdAndTipoAndStatusNot(
            Integer agendamentoId,
            TipoNotificacaoEnum tipo,
            StatusNotificacaoEnum status);

    List<Notificacao> findByAgendamento_IdAndTipoAndStatusNotIn(
            Integer agendamentoId,
            TipoNotificacaoEnum tipo,
            Collection<StatusNotificacaoEnum> statuses);

    @Query(
            """
            SELECT DISTINCT n FROM Notificacao n
            JOIN FETCH n.agendamento a
            LEFT JOIN FETCH a.cliente c
            LEFT JOIN FETCH a.servico s
            WHERE (
              (n.status = :pendente AND n.tentativas < :limiteTentativas)
              OR (n.status = :falhou AND n.tentativas < :limiteTentativas
                  AND n.proximaRetentativa IS NOT NULL
                  AND n.proximaRetentativa <= :agora)
            )
            ORDER BY n.criadoEm ASC
            """)
    List<Notificacao> findParaReprocessarEnvio(
            @Param("agora") LocalDateTime agora,
            @Param("pendente") StatusNotificacaoEnum pendente,
            @Param("falhou") StatusNotificacaoEnum falhou,
            @Param("limiteTentativas") int limiteTentativas);

    @EntityGraph(attributePaths = {"agendamento"})
    List<Notificacao> findByStatus(StatusNotificacaoEnum status);

    @EntityGraph(attributePaths = {"agendamento"})
    List<Notificacao> findByStatusAndTentativasLessThan(StatusNotificacaoEnum status, Integer tentativas);

    Optional<Notificacao> findByTwilioMessageSid(String twilioMessageSid);

    Optional<Notificacao> findByTwilioMessageSidAndTipo(String twilioMessageSid, TipoNotificacaoEnum tipo);

    @EntityGraph(attributePaths = {"agendamento"})
    @Query("SELECT n FROM Notificacao n WHERE n.twilioMessageSid = :sid")
    Optional<Notificacao> findByTwilioMessageSidWithAgendamento(@Param("sid") String sid);
}
