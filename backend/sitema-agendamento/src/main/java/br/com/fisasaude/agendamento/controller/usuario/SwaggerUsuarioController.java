package br.com.fisasaude.agendamento.controller.usuario;

import br.com.fisasaude.agendamento.dto.usuario.UsuarioCreateRequestDto;
import br.com.fisasaude.agendamento.dto.usuario.UsuarioResponseDto;
import br.com.fisasaude.agendamento.dto.usuario.UsuarioUpdateRequestDto;
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

@Tag(name = "Usuarios", description = "Operacoes CRUD para usuarios")
public interface SwaggerUsuarioController {

    @Operation(summary = "Criar usuario", description = "Cria um novo usuario no sistema")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Usuario criado com sucesso", content = @Content(schema = @Schema(implementation = UsuarioResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Estabelecimento nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflito de email", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Dados semanticamente invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<UsuarioResponseDto> criar(@Valid @RequestBody UsuarioCreateRequestDto dto);

    @Operation(summary = "Listar usuarios", description = "Retorna todos os usuarios cadastrados")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuarios retornados com sucesso")
    })
    ResponseEntity<List<UsuarioResponseDto>> listarTodos();

    @Operation(summary = "Buscar usuario por ID", description = "Retorna um usuario pelo identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado", content = @Content(schema = @Schema(implementation = UsuarioResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<UsuarioResponseDto> buscarPorId(@PathVariable Integer id);

    @Operation(summary = "Atualizar usuario", description = "Atualiza os dados de um usuario existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario atualizado com sucesso", content = @Content(schema = @Schema(implementation = UsuarioResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Requisicao invalida", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuario ou estabelecimento nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflito de email", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Dados semanticamente invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<UsuarioResponseDto> atualizar(
            @Parameter(description = "ID do usuario", example = "1") @PathVariable Integer id,
            @Valid @RequestBody UsuarioUpdateRequestDto dto
    );

    @Operation(summary = "Remover usuario", description = "Remove um usuario pelo identificador")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Usuario removido com sucesso"),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<Void> deletar(@PathVariable Integer id);
}
