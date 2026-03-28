package br.com.fisasaude.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/webhook")
public class WebhookController {

    @PostMapping("/whatsapp")
    public void receberMensagem(
            @RequestParam("Body") String body,
            @RequestParam("From") String from
    ) {

        System.out.println("Mensagem recebida: " + body);
        System.out.println("Telefone: " + from);

    }
}