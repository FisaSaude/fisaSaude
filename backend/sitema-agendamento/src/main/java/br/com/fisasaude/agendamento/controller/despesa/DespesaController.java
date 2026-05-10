package br.com.fisasaude.agendamento.controller.despesa;

import br.com.fisasaude.agendamento.dto.despesa.DespesaCreateRequestDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaResponseDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaUpdateRequestDto;
import br.com.fisasaude.agendamento.service.DespesaService;
import jakarta.validation.Valid;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/despesas")
public class DespesaController implements SwaggerDespesaController {
    private final DespesaService despesaService;

    public DespesaController(DespesaService despesaService) {
        this.despesaService = despesaService;
    }

    @PostMapping
    public ResponseEntity<DespesaResponseDto> criar(@Valid @RequestBody DespesaCreateRequestDto dto) {
        DespesaResponseDto response = despesaService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<DespesaResponseDto>> listarTodos() {
        return ResponseEntity.ok(despesaService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DespesaResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(despesaService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DespesaResponseDto> atualizar(@PathVariable Integer id, @Valid @RequestBody DespesaUpdateRequestDto dto) {
        return ResponseEntity.ok(despesaService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        despesaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/estabelecimento/{estabelecimentoId}")
    public ResponseEntity<List<DespesaResponseDto>> listarPorEstabelecimentoId(
            @PathVariable Integer estabelecimentoId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) java.time.LocalDate dataFim) {
        return ResponseEntity.ok(despesaService.listarPorEstabelecimentoId(estabelecimentoId, dataInicio, dataFim));
    }
}
