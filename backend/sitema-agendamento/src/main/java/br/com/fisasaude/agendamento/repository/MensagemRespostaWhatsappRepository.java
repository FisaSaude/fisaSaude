package br.com.fisasaude.agendamento.repository;

import br.com.fisasaude.agendamento.model.entity.MensagemRespostaWhatsapp;
import br.com.fisasaude.agendamento.model.enums.RespostaWhatsappTipoEnum;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensagemRespostaWhatsappRepository extends JpaRepository<MensagemRespostaWhatsapp, Integer> {

    boolean existsByTwilioMessageSid(String twilioMessageSid);

    boolean existsByAgendamento_IdAndRespostaTipo(Integer agendamentoId, RespostaWhatsappTipoEnum respostaTipo);

    @EntityGraph(attributePaths = {"agendamento", "cliente"})
    Optional<MensagemRespostaWhatsapp> findFirstByAgendamento_IdAndRespostaTipoOrderByDataRecebidaDesc(
            Integer agendamentoId,
            RespostaWhatsappTipoEnum tipo
    );
}
