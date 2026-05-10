package br.com.fisasaude.agendamento.controller.estabelecimento;

import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoResponseDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoUpdateRequestDto;
import br.com.fisasaude.agendamento.service.EstabelecimentoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/estabelecimentos")
public class EstabelecimentoController implements SwaggerEstabelecimentoController {

    private final EstabelecimentoService estabelecimentoService;

    public EstabelecimentoController(EstabelecimentoService estabelecimentoService) {
        this.estabelecimentoService = estabelecimentoService;
    }

    @PostMapping
    public ResponseEntity<EstabelecimentoResponseDto> criar(@Valid @RequestBody EstabelecimentoCreateRequestDto dto) {
        EstabelecimentoResponseDto response = estabelecimentoService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<EstabelecimentoResponseDto>> listarTodos() {
        return ResponseEntity.ok(estabelecimentoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EstabelecimentoResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(estabelecimentoService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EstabelecimentoResponseDto> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody EstabelecimentoUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(estabelecimentoService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        estabelecimentoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}

