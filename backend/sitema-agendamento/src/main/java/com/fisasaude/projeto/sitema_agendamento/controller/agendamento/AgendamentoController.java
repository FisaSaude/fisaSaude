package com.fisasaude.projeto.sitema_agendamento.controller.agendamento;

import com.fisasaude.projeto.sitema_agendamento.feignclient.ApiFeriados;
import com.fisasaude.projeto.sitema_agendamento.feignclient.FeriadoDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// TESTE DA API DOS FERIADOS
@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    private final ApiFeriados apiFeriados;

    public AgendamentoController(ApiFeriados apiFeriados) {
        this.apiFeriados = apiFeriados;
    }

    @GetMapping("/feriados/{ano}")
    public ResponseEntity<List<FeriadoDto>> listarFeriados(@PathVariable Integer ano) {
        return ResponseEntity.ok(apiFeriados.listarFeriados(ano));
    }
}
