package br.com.fisasaude.agendamento.controller.prontuario;

import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioCreateRequestDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioResponseDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioUpdateRequestDto;
import br.com.fisasaude.agendamento.service.ProntuarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/prontuarios")
public class ProntuarioController implements SwaggerProntuarioController {
    private final ProntuarioService prontuarioService;

    public ProntuarioController(ProntuarioService prontuarioService) {
        this.prontuarioService = prontuarioService;
    }

    @PostMapping
    public ResponseEntity<ProntuarioResponseDto> criar(@Valid @RequestBody ProntuarioCreateRequestDto dto) {
        ProntuarioResponseDto response = prontuarioService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProntuarioResponseDto>> listarTodos() {
        return ResponseEntity.ok(prontuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProntuarioResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(prontuarioService.buscarPorId(id));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<ProntuarioResponseDto>> buscarPorClienteId(@PathVariable Integer clienteId) {
        return ResponseEntity.ok(prontuarioService.buscarPorClienteId(clienteId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProntuarioResponseDto> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ProntuarioUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(prontuarioService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        prontuarioService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
