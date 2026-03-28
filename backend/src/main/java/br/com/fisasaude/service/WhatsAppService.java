package br.com.fisasaude.service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class WhatsAppService {

    @Value("${twilio.whatsapp.from}")
    private String from;

    public void enviarMensagem(String telefone, String mensagem) {

        Message.creator(
                new PhoneNumber("whatsapp:+55" + telefone),
                new PhoneNumber(from),
                mensagem
        ).create();
    }
}