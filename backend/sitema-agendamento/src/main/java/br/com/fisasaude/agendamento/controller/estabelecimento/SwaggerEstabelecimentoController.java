package br.com.fisasaude.agendamento.controller.estabelecimento;

import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoResponseDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoUpdateRequestDto;
import br.com.fisasaude.agendamento.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Estabelecimentos", description = "Operacoes CRUD para estabelecimentos")
public interface SwaggerEstabelecimentoController {

    @Operation(summary = "Criar estabelecimento", description = "Cria um novo estabelecimento no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Estabelecimento criado com sucesso", content = @Content(schema = @Schema(implementation = EstabelecimentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Dados semanticamente invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<EstabelecimentoResponseDto> criar(@Valid @RequestBody EstabelecimentoCreateRequestDto dto);

    @Operation(summary = "Listar estabelecimentos", description = "Retorna todos os estabelecimentos cadastrados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estabelecimentos retornados com sucesso")
    })
    ResponseEntity<List<EstabelecimentoResponseDto>> listarTodos();

    @Operation(summary = "Buscar estabelecimento por ID", description = "Retorna um estabelecimento pelo identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estabelecimento encontrado", content = @Content(schema = @Schema(implementation = EstabelecimentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Estabelecimento nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<EstabelecimentoResponseDto> buscarPorId(@PathVariable Integer id);

    @Operation(summary = "Atualizar estabelecimento", description = "Atualiza os dados de um estabelecimento existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estabelecimento atualizado com sucesso", content = @Content(schema = @Schema(implementation = EstabelecimentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Estabelecimento nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Dados semanticamente invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<EstabelecimentoResponseDto> atualizar(
            @Parameter(description = "ID do estabelecimento", example = "1") @PathVariable Integer id,
            @Valid @RequestBody EstabelecimentoUpdateRequestDto dto
    );

    @Operation(summary = "Remover estabelecimento", description = "Remove um estabelecimento pelo identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Estabelecimento removido com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Estabelecimento nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> deletar(@PathVariable Integer id);
}

