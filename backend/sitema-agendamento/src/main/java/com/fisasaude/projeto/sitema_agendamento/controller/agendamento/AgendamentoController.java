package com.fisasaude.projeto.sitema_agendamento.controller.agendamento;

import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoResumoPeriodoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.feignclient.ApiFeriados;
import com.fisasaude.projeto.sitema_agendamento.feignclient.FeriadoDto;
import com.fisasaude.projeto.sitema_agendamento.service.AgendamentoService;
import java.time.LocalDate;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// TESTE DA API DOS FERIADOS
@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController {

    private final ApiFeriados apiFeriados;
    private final AgendamentoService agendamentoService;

    public AgendamentoController(ApiFeriados apiFeriados, AgendamentoService agendamentoService) {
        this.apiFeriados = apiFeriados;
        this.agendamentoService = agendamentoService;
    }

    @GetMapping("/feriados/{ano}")
    public ResponseEntity<List<FeriadoDto>> listarFeriados(@PathVariable Integer ano) {
        return ResponseEntity.ok(apiFeriados.listarFeriados(ano));
    }

    @GetMapping("/resumo-status")
    public ResponseEntity<AgendamentoResumoPeriodoResponseDto> resumirStatusPorPeriodo(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return ResponseEntity.ok(agendamentoService.obterResumoPorStatusNoPeriodo(dataInicio, dataFim));
    }
}
