package com.fisasaude.projeto.sitema_agendamento.controller.notificacao;

import com.fisasaude.projeto.sitema_agendamento.dto.notificacao.NotificacaoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Notificacoes", description = "Consultas para filas de envio / retry")
public interface SwaggerNotificacaoController {

    @Operation(summary = "Listar notificacoes pendentes", description = "Ordena por proxima retentativa e criacao.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = NotificacaoResponseDto.class)))),
            @ApiResponse(responseCode = "401", description = "Nao autenticado"),
            @ApiResponse(responseCode = "403", description = "Sem permissao")
    })
    ResponseEntity<List<NotificacaoResponseDto>> listarPendentes();

    @Operation(summary = "Listar notificacoes com falha candidatas a retry", description = "tentativas < limiteInformado.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = NotificacaoResponseDto.class)))),
            @ApiResponse(responseCode = "400", description = "Parametro invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Nao autenticado"),
            @ApiResponse(responseCode = "403", description = "Sem permissao")
    })
    ResponseEntity<List<NotificacaoResponseDto>> listarFalhasParaRetry(
            @Parameter(description = "Lista registros onde tentativas < este valor") @RequestParam(defaultValue = "5") Integer tentativasMaximasExclusive
    );
}
