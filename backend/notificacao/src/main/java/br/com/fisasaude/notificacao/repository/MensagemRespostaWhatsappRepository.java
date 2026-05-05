package br.com.fisasaude.notificacao.repository;

import br.com.fisasaude.notificacao.model.entity.MensagemRespostaWhatsapp;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MensagemRespostaWhatsappRepository extends JpaRepository<MensagemRespostaWhatsapp, Integer> {

    boolean existsByTwilioMessageSid(String twilioMessageSid);
}
