package br.com.fisasaude.notificacao.controller.webhook;

import br.com.fisasaude.notificacao.service.WhatsAppInboundService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhook/twilio")
public class TwilioWebhookController {

    private static final Logger log = LoggerFactory.getLogger(TwilioWebhookController.class);

    private final WhatsAppInboundService inboundService;

    public TwilioWebhookController(WhatsAppInboundService inboundService) {
        this.inboundService = inboundService;
    }

    @PostMapping(value = "/whatsapp/incoming", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> inbound(
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(value = "WaId", required = false) String waId,
            @RequestParam(value = "To", required = false) String to,
            @RequestParam(value = "Body", required = false) String body,
            @RequestParam(value = "MessageSid", required = false) String messageSid,
            @RequestParam(value = "ButtonPayload", required = false) String buttonPayload,
            @RequestParam(value = "ButtonText", required = false) String buttonText,
            @RequestParam(value = "OriginalRepliedMessageSid", required = false)
                    String originalRepliedMessageSid) {

        try {
            inboundService.processarEntradaPaciente(
                    from, waId, body, messageSid, buttonPayload, buttonText, originalRepliedMessageSid);

        } catch (Exception ex) {
            log.error("Falha ao processar webhook Twilio whatsapp/incoming.", ex);
        }

        return ResponseEntity.ok("");
    }

    @PostMapping(value = "/whatsapp/status", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> status(
            @RequestParam(value = "MessageSid", required = false) String messageSid,
            @RequestParam(value = "MessageStatus", required = false) String messageStatus) {
        try {
            inboundService.registrarCallbackStatusParaLogOpcional(messageSid, messageStatus);
        } catch (Exception ex) {
            log.error("Falha ao processar webhook Twilio whatsapp/status.", ex);
        }
        return ResponseEntity.ok("");
    }
}
