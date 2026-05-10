package br.com.fisasaude.agendamento.controller.prontuario;

import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioCreateRequestDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioResponseDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioUpdateRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@Tag(name = "Prontuários", description = "CRUD de prontuários de clientes")
public interface SwaggerProntuarioController {
    @Operation(summary = "Criar prontuário", description = "Cria um novo prontuário para um cliente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Criado", content = @Content(schema = @Schema(implementation = ProntuarioResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Validacao", content = @Content),
        @ApiResponse(responseCode = "404", description = "Cliente nao encontrado", content = @Content)
    })
    ResponseEntity<ProntuarioResponseDto> criar(@Valid @RequestBody ProntuarioCreateRequestDto dto);

    @Operation(summary = "Listar todos os prontuários", description = "Retorna todos os prontuários cadastrados.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ProntuarioResponseDto.class))))
    })
    ResponseEntity<List<ProntuarioResponseDto>> listarTodos();

    @Operation(summary = "Buscar prontuário por id", description = "Retorna um prontuário pelo seu id.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Encontrado", content = @Content(schema = @Schema(implementation = ProntuarioResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Nao encontrado", content = @Content)
    })
    ResponseEntity<ProntuarioResponseDto> buscarPorId(@Parameter(description = "ID do prontuário", required = true, example = "1") @PathVariable Integer id);

    @Operation(summary = "Buscar prontuários por cliente", description = "Retorna todos os prontuários de um cliente pelo id do cliente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada", content = @Content(array = @ArraySchema(schema = @Schema(implementation = ProntuarioResponseDto.class)))),
        @ApiResponse(responseCode = "404", description = "Nenhum prontuário encontrado para o cliente", content = @Content)
    })
    ResponseEntity<List<ProntuarioResponseDto>> buscarPorClienteId(@Parameter(description = "ID do cliente", required = true, example = "1") @PathVariable Integer clienteId);

    @Operation(summary = "Atualizar prontuário", description = "Atualiza um prontuário existente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Atualizado", content = @Content(schema = @Schema(implementation = ProntuarioResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Nao encontrado", content = @Content)
    })
    ResponseEntity<ProntuarioResponseDto> atualizar(@Parameter(description = "ID do prontuário", required = true, example = "1") @PathVariable Integer id, @Valid @RequestBody ProntuarioUpdateRequestDto dto);

    @Operation(summary = "Deletar prontuário", description = "Remove um prontuário pelo id.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Removido com sucesso"),
        @ApiResponse(responseCode = "404", description = "Nao encontrado", content = @Content)
    })
    ResponseEntity<Void> deletar(@Parameter(description = "ID do prontuário", required = true, example = "1") @PathVariable Integer id);
}

