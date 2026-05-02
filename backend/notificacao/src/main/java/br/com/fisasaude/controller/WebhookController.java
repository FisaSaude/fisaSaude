package br.com.fisasaude.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhook")
@Tag(name = "Webhook", description = "Endpoints para recebimento de webhooks de notificações")
public class WebhookController {

    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    @PostMapping("/whatsapp")
    @Operation(summary = "Receber mensagem WhatsApp", description = "Webhook para receber mensagens de entrada via WhatsApp")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Webhook processado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Parâmetros inválidos")
    })
    @ResponseStatus(HttpStatus.OK)
    public void receberMensagem(
            @Parameter(description = "Corpo da mensagem") @RequestParam("Body") String body,
            @Parameter(description = "Número de telefone do remetente") @RequestParam("From") String from
    ) {
        log.info("Webhook WhatsApp From={} BodyLength={}", from, body != null ? body.length() : 0);
    }
}