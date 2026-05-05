package br.com.fisasaude.agendamento.controller.internal;

import br.com.fisasaude.agendamento.dto.internal.AgendamentoRespostaWhatsappRequestDto;
import br.com.fisasaude.agendamento.service.AgendamentoService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/internal/v1/agendamentos")
public class InternalAgendamentoController {

    private static final Logger log = LoggerFactory.getLogger(InternalAgendamentoController.class);

    private final AgendamentoService agendamentoService;

    public InternalAgendamentoController(AgendamentoService agendamentoService) {
        this.agendamentoService = agendamentoService;
    }

    /** Chamado apenas pelo microsservico de notificacao apos registrar mensagem_resposta_whatsapp. */
    @PostMapping("/{agendamentoId}/resposta-whatsapp")
    public ResponseEntity<Void> responder(
            @PathVariable Integer agendamentoId, @Valid @RequestBody AgendamentoRespostaWhatsappRequestDto body) {

        log.info("ENTROU NO ENDPOINT RESPOSTA WHATSAPP id={} tipo={}", agendamentoId, body.tipo());

        agendamentoService.aplicarRespostaWhatsappInbound(agendamentoId, body.tipo());

        return ResponseEntity.noContent().build();
    }
}
