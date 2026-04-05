package br.com.fisasaude.controller;

import br.com.fisasaude.dto.MensagemRequest;
import br.com.fisasaude.service.WhatsAppService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/whatsapp")
@Tag(name = "WhatsApp", description = "Operações para envio de mensagens WhatsApp")
public class WhatsAppController {

    @Autowired
    private WhatsAppService service;

    @PostMapping("/enviar")
    @Operation(summary = "Enviar mensagem WhatsApp", description = "Envia uma mensagem para um número de telefone via WhatsApp")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mensagem enviada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Requisição inválida")
    })
    public ResponseEntity<String> enviar(@RequestBody MensagemRequest request) {

        service.enviarMensagem(
                request.getTelefone(),
                request.getMensagem()
        );

        return ResponseEntity.ok("Mensagem enviada");
    }
}