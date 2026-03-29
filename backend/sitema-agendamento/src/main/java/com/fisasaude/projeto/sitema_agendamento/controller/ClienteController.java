package com.fisasaude.projeto.sitema_agendamento.controller;

import com.fisasaude.projeto.sitema_agendamento.dto.ClienteCreateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.dto.ClienteResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.ClienteUpdateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.fisasaude.projeto.sitema_agendamento.service.ClienteService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
@Tag(name = "Clientes", description = "Operacoes CRUD para clientes")
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    @Operation(summary = "Criar cliente", description = "Cria um novo cliente no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Cliente criado com sucesso", content = @Content(schema = @Schema(implementation = ClienteResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflito de telefone", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Dados semanticamente invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ClienteResponseDto> criar(@Valid @RequestBody ClienteCreateRequestDto dto) {
        ClienteResponseDto response = clienteService.criar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar clientes", description = "Retorna todos os clientes cadastrados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Clientes retornados com sucesso")
    })
    public ResponseEntity<List<ClienteResponseDto>> listarTodos() {
        return ResponseEntity.ok(clienteService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar cliente por ID", description = "Retorna um cliente pelo identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cliente encontrado", content = @Content(schema = @Schema(implementation = ClienteResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Cliente nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ClienteResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar cliente", description = "Atualiza os dados de um cliente existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cliente atualizado com sucesso", content = @Content(schema = @Schema(implementation = ClienteResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Cliente nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflito de telefone", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Dados semanticamente invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<ClienteResponseDto> atualizar(
            @Parameter(description = "ID do cliente", example = "1") @PathVariable Integer id,
            @Valid @RequestBody ClienteUpdateRequestDto dto
    ) {
        return ResponseEntity.ok(clienteService.atualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remover cliente", description = "Remove um cliente pelo identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Cliente removido com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Cliente nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<Void> deletar(@PathVariable Integer id) {
        clienteService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
