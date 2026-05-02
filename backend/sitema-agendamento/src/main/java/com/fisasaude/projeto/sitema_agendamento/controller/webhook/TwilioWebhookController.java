package com.fisasaude.projeto.sitema_agendamento.controller.webhook;

import com.fisasaude.projeto.sitema_agendamento.service.WhatsAppInboundService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/webhook/twilio")
public class TwilioWebhookController {

    private final WhatsAppInboundService inboundService;

    public TwilioWebhookController(WhatsAppInboundService inboundService) {
        this.inboundService = inboundService;
    }

    /** Sandbox / producao inbound do WhatsApp (form urlencoded Twilio). */
    @PostMapping(value = "/whatsapp/incoming", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> inbound(
            @RequestParam(value = "From", required = false) String from,
            @RequestParam(value = "Body", required = false) String body,
            @RequestParam(value = "MessageSid", required = false) String messageSid
    ) {
        inboundService.processarEntradaPaciente(from, body, messageSid);
        return ResponseEntity.ok("");
    }

    /** Status callback opcional (delivered, failed, ...) — apenas log MVP. */
    @PostMapping(value = "/whatsapp/status", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> status(
            @RequestParam(value = "MessageSid", required = false) String messageSid,
            @RequestParam(value = "MessageStatus", required = false) String messageStatus
    ) {
        inboundService.registrarCallbackStatusParaLogOpcional(messageSid, messageStatus);
        return ResponseEntity.ok("");
    }
}
