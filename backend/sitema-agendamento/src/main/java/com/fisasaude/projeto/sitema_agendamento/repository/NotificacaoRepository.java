package com.fisasaude.projeto.sitema_agendamento.repository;

import com.fisasaude.projeto.sitema_agendamento.model.entity.Notificacao;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusNotificacaoEnum;
import com.fisasaude.projeto.sitema_agendamento.model.enums.TipoNotificacaoEnum;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Integer> {

    List<Notificacao> findByStatus(StatusNotificacaoEnum status);

    List<Notificacao> findByStatusAndTentativasLessThan(
            StatusNotificacaoEnum status,
            Integer tentativas
    );

    Optional<Notificacao> findByTwilioMessageSid(String twilioMessageSid);

    Optional<Notificacao> findByTwilioMessageSidAndTipo(
            String twilioMessageSid,
            TipoNotificacaoEnum tipo
    );
}
