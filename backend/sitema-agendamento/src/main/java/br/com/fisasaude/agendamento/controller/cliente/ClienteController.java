package br.com.fisasaude.agendamento.controller.cliente;

import br.com.fisasaude.agendamento.dto.cliente.ClienteCreateRequestDto;
import br.com.fisasaude.agendamento.dto.cliente.ClienteResponseDto;
import br.com.fisasaude.agendamento.dto.cliente.ClienteUpdateRequestDto;
import br.com.fisasaude.agendamento.service.ClienteService;
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
@RequestMapping("/clientes")
public class ClienteController implements SwaggerClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @PostMapping
    public ResponseEntity<ClienteResponseDto> criar(@Valid @RequestBody ClienteCreateRequestDto dto) {
        ClienteResponseDto response = clienteService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ClienteResponseDto>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponseDto> atualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ClienteUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(clienteService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        clienteService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
