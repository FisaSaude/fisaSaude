package br.com.fisasaude.agendamento.controller.agendamento;

import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoBloquearPeriodoRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoRemarcarRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoUsuarioPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.DiaValidoPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.HorarioSlotResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.TaxaOcupacaoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.VerificacaoConflitoAgendamentoResponseDto;
import br.com.fisasaude.agendamento.feignclient.ApiFeriados;
import br.com.fisasaude.agendamento.model.enums.StatusAgendamentoEnum;
import br.com.fisasaude.agendamento.service.AgendamentoService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/agendamentos")
public class AgendamentoController implements SwaggerAgendamentoController {

    private final ApiFeriados apiFeriados;
    private final AgendamentoService agendamentoService;

    public AgendamentoController(ApiFeriados apiFeriados, AgendamentoService agendamentoService) {
        this.apiFeriados = apiFeriados;
        this.agendamentoService = agendamentoService;
    }

    @PostMapping
    public ResponseEntity<AgendamentoResponseDto> criar(@Valid @RequestBody AgendamentoCreateRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(agendamentoService.criar(dto));
    }

    @GetMapping("/registro/{id}")
    public ResponseEntity<AgendamentoResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(agendamentoService.buscarPorId(id));
    }

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<AgendamentoResponseDto> cancelar(@PathVariable Integer id) {
        return ResponseEntity.ok(agendamentoService.cancelar(id));
    }

    @PostMapping("/{id}/concluir")
    public ResponseEntity<AgendamentoResponseDto> concluir(@PathVariable Integer id) {
        return ResponseEntity.ok(agendamentoService.concluir(id));
    }

    @PostMapping("/{id}/remarcar")
    public ResponseEntity<AgendamentoResponseDto> remarcar(
            @PathVariable Integer id,
            @Valid @RequestBody AgendamentoRemarcarRequestDto dto
    ) {
        return ResponseEntity.ok(agendamentoService.remarcar(id, dto));
    }

    @GetMapping(params = {"status", "dataInicio", "dataFim"})
    public ResponseEntity<List<AgendamentoResponseDto>> listarPorStatusEPeriodo(
            @RequestParam StatusAgendamentoEnum status,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return ResponseEntity.ok(agendamentoService.listarPorStatusEPeriodo(status, dataInicio, dataFim));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<AgendamentoResponseDto>> listarPorCliente(@PathVariable Integer clienteId) {
        return ResponseEntity.ok(agendamentoService.listarPorCliente(clienteId));
    }

    @GetMapping("/para-lembrete")
    public ResponseEntity<List<AgendamentoResponseDto>> listarParaLembrete(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false) StatusAgendamentoEnum status
    ) {
        return ResponseEntity.ok(agendamentoService.listarParaLembrete(data, status));
    }

    @GetMapping("/verificar-conflito")
    public ResponseEntity<VerificacaoConflitoAgendamentoResponseDto> verificarConflitoHorario(
            @RequestParam Integer usuarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaFim,
            @RequestParam(required = false) Integer excludeAgendamentoId
    ) {
        return ResponseEntity.ok(
                agendamentoService.verificarConflitoHorario(usuarioId, data, horaInicio, horaFim, excludeAgendamentoId)
        );
    }

    @GetMapping("/slots-disponiveis")
    public ResponseEntity<List<HorarioSlotResponseDto>> slotsDisponiveis(
            @RequestParam Integer usuarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @RequestParam(required = false, defaultValue = "60") Integer duracaoMinutos
    ) {
        return ResponseEntity.ok(agendamentoService.listarSlotsDisponiveis(usuarioId, data, duracaoMinutos));
    }

    @GetMapping("/usuario-periodo")
    public ResponseEntity<List<AgendamentoUsuarioPeriodoResponseDto>> listarPorUsuarioEPeriodo(
            @RequestParam Integer usuarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return ResponseEntity.ok(agendamentoService.listarPorUsuarioEPeriodo(usuarioId, dataInicio, dataFim));
    }
    
    @GetMapping("listar-dias-validos")
    public ResponseEntity<List<DiaValidoPeriodoResponseDto>> listarDiasValidos(
            @RequestParam Integer usuarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    ) {
        return ResponseEntity.ok(agendamentoService.listarDiasValidos(usuarioId, dataInicio, dataFim));
    }

    @PostMapping("/bloquear-periodo")
    public ResponseEntity<Void> bloquearPeriodo(@Valid @RequestBody AgendamentoBloquearPeriodoRequestDto dto) {
        agendamentoService.bloquearPeriodo(dto);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/taxa-ocupacao")
    public ResponseEntity<TaxaOcupacaoResponseDto> taxaOcupacao(
            @RequestParam Integer usuarioId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @RequestParam(required = false, defaultValue = "60") Integer duracaoMinutos
    ) {
        return ResponseEntity.ok(agendamentoService.calcularTaxaOcupacao(usuarioId, dataInicio, dataFim, duracaoMinutos));
    }
}
