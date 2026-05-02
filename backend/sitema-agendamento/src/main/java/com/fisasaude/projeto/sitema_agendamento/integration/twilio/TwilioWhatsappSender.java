package com.fisasaude.projeto.sitema_agendamento.integration.twilio;

import com.fisasaude.projeto.sitema_agendamento.config.NotificacaoAppProperties;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class TwilioWhatsappSender {

    private static final Logger log = LoggerFactory.getLogger(TwilioWhatsappSender.class);

    private final NotificacaoAppProperties props;
    private volatile boolean initialized;

    public TwilioWhatsappSender(NotificacaoAppProperties props) {
        this.props = props;
    }

    /** Envia mensagem texto; numero destino com ou sem prefixo whatsapp:. */
    public String enviarTextoParaWhatsapp(String destinoE164OuWhatsapp, String corpo)
            throws com.twilio.exception.TwilioException {
        if (!props.isTwilioEnabled()) {
            log.warn("Twilio desabilitado (app.notifications.twilio-enabled=false): mensagem seria para {} — preview: {}",
                    destinoE164OuWhatsapp, shorten(corpo, 120));
            return "DISABLED_PREVIEW";
        }
        initClientIfNeeded();
        String para = garantirPrefixoWhatsapp(destinoE164OuWhatsapp);
        String de = garantirPrefixoWhatsapp(props.getWhatsappFrom());
        Message mensagem =
                Message.creator(new PhoneNumber(para), new PhoneNumber(de), corpo.trim()).create();
        log.info("Twilio Message enviado sid={} para={}", mensagem.getSid(), para);
        return mensagem.getSid();
    }

    private synchronized void initClientIfNeeded() {
        if (initialized) {
            return;
        }
        Twilio.init(props.getAccountSid(), props.getAuthToken());
        initialized = true;
        log.info("Cliente Twilio inicializado (sid prefixo {}).", primeiraParteSid(props.getAccountSid()));
    }

    static String garantirPrefixoWhatsapp(String numeroOuWhatsapp) {
        if (numeroOuWhatsapp == null || numeroOuWhatsapp.isBlank()) {
            throw new IllegalArgumentException("numero vazio");
        }
        String t = numeroOuWhatsapp.trim();
        if (t.regionMatches(true, 0, "whatsapp:", 0, 9)) {
            return "whatsapp:" + t.substring("whatsapp:".length()).trim();
        }
        return "whatsapp:" + t;
    }

    private static String primeiraParteSid(String sid) {
        if (sid == null || sid.length() < 6) {
            return "???";
        }
        return sid.substring(0, 4) + "...";
    }

    private static String shorten(String s, int max) {
        if (s == null) {
            return "";
        }
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
