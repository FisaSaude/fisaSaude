package br.com.fisasaude.controller;

import br.com.fisasaude.dto.MensagemRequest;
import br.com.fisasaude.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/whatsapp")
public class WhatsAppController {

    @Autowired
    private WhatsAppService service;

    @PostMapping("/enviar")
    public String enviar(@RequestBody MensagemRequest request) {

        service.enviarMensagem(
                request.getTelefone(),
                request.getMensagem()
        );

        return "Mensagem enviada";
    }
}