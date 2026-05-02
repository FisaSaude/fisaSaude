package com.fisasaude.projeto.sitema_agendamento.controller.notificacao;

import com.fisasaude.projeto.sitema_agendamento.dto.notificacao.NotificacaoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.service.NotificacaoService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notificacoes")
public class NotificacaoController implements SwaggerNotificacaoController {

    private final NotificacaoService notificacaoService;

    public NotificacaoController(NotificacaoService notificacaoService) {
        this.notificacaoService = notificacaoService;
    }

    @GetMapping("/pendentes")
    @Override
    public ResponseEntity<List<NotificacaoResponseDto>> listarPendentes() {
        return ResponseEntity.ok(notificacaoService.listarPendentesOrdenadas());
    }

    @GetMapping("/falhou-retry")
    @Override
    public ResponseEntity<List<NotificacaoResponseDto>> listarFalhasParaRetry(
            @RequestParam(defaultValue = "5") Integer tentativasMaximasExclusive
    ) {
        return ResponseEntity.ok(notificacaoService.listarFalhasParaRetry(tentativasMaximasExclusive));
    }
}
