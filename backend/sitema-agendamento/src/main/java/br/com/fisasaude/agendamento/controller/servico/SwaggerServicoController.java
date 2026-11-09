package br.com.fisasaude.agendamento.controller.servico;

import br.com.fisasaude.agendamento.dto.servico.ServicoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.servico.ServicoResponseDto;
import br.com.fisasaude.agendamento.dto.servico.ServicoUpdateRequestDto;
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

@Tag(name = "Servicos", description = "Operacoes CRUD para servicos")
public interface SwaggerServicoController {

    @Operation(summary = "Criar servico", description = "Cria um novo servico no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Servico criado com sucesso",
                    content = @Content(schema = @Schema(implementation = ServicoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Requisicao invalida",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Dados semanticamente invalidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<ServicoResponseDto> criar(@Valid @RequestBody ServicoCreateRequestDto dto);

    @Operation(summary = "Listar servicos", description = "Retorna todos os servicos cadastrados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Servicos retornados com sucesso")
    })
    ResponseEntity<List<ServicoResponseDto>> listarTodos();

    @Operation(summary = "Buscar servico por ID", description = "Retorna um servico pelo identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Servico encontrado",
                    content = @Content(schema = @Schema(implementation = ServicoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "ID invalido",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Servico nao encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<ServicoResponseDto> buscarPorId(@PathVariable Integer id);

    @Operation(summary = "Atualizar servico", description = "Atualiza os dados de um servico existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Servico atualizado com sucesso",
                    content = @Content(schema = @Schema(implementation = ServicoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Requisicao invalida",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Servico nao encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Dados semanticamente invalidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<ServicoResponseDto> atualizar(
            @Parameter(description = "ID do servico", example = "1") @PathVariable Integer id,
            @Valid @RequestBody ServicoUpdateRequestDto dto
    );

    @Operation(summary = "Remover servico", description = "Remove um servico sem agendamentos vinculados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Servico removido com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID invalido",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Servico nao encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Servico possui agendamentos vinculados",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> deletar(@PathVariable Integer id);
}
