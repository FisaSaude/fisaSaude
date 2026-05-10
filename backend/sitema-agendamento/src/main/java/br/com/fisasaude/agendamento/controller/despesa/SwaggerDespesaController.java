package br.com.fisasaude.agendamento.controller.despesa;

import br.com.fisasaude.agendamento.dto.despesa.DespesaCreateRequestDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaResponseDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaUpdateRequestDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@Tag(name = "Despesas", description = "CRUD de despesas do estabelecimento")
public interface SwaggerDespesaController {
    @Operation(summary = "Criar despesa", description = "Cria uma nova despesa para o estabelecimento.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Criado", content = @Content(schema = @Schema(implementation = DespesaResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Validacao", content = @Content),
        @ApiResponse(responseCode = "404", description = "Estabelecimento nao encontrado", content = @Content)
    })
    ResponseEntity<DespesaResponseDto> criar(@Valid @RequestBody DespesaCreateRequestDto dto);

    @Operation(summary = "Listar todas as despesas", description = "Retorna todas as despesas cadastradas.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = DespesaResponseDto.class))))
    })
    ResponseEntity<List<DespesaResponseDto>> listarTodos();

    @Operation(summary = "Buscar despesa por id", description = "Retorna uma despesa pelo seu id.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Encontrado", content = @Content(schema = @Schema(implementation = DespesaResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Nao encontrado", content = @Content)
    })
    ResponseEntity<DespesaResponseDto> buscarPorId(@Parameter(description = "ID da despesa", required = true, example = "1") @PathVariable Integer id);

    @Operation(summary = "Atualizar despesa", description = "Atualiza uma despesa existente.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Atualizado", content = @Content(schema = @Schema(implementation = DespesaResponseDto.class))),
        @ApiResponse(responseCode = "404", description = "Nao encontrado", content = @Content)
    })
    ResponseEntity<DespesaResponseDto> atualizar(@Parameter(description = "ID da despesa", required = true, example = "1") @PathVariable Integer id, @Valid @RequestBody DespesaUpdateRequestDto dto);

    @Operation(summary = "Deletar despesa", description = "Remove uma despesa pelo id.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Removido com sucesso"),
        @ApiResponse(responseCode = "404", description = "Nao encontrado", content = @Content)
    })
    ResponseEntity<Void> deletar(@Parameter(description = "ID da despesa", required = true, example = "1") @PathVariable Integer id);

    @Operation(summary = "Listar despesas por estabelecimento e periodo", description = "Lista despesas de um estabelecimento, podendo filtrar por data inicial e final.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso", content = @Content(array = @ArraySchema(schema = @Schema(implementation = DespesaResponseDto.class))))
    })
    ResponseEntity<List<DespesaResponseDto>> listarPorEstabelecimentoId(
        @Parameter(description = "ID do estabelecimento", required = true, example = "1") @PathVariable Integer estabelecimentoId,
        @Parameter(description = "Data inicial (opcional)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
        @Parameter(description = "Data final (opcional)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    );
}

