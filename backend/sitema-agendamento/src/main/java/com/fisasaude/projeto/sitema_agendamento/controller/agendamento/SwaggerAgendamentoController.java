package com.fisasaude.projeto.sitema_agendamento.controller.agendamento;

import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoResumoPeriodoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.exception.ErrorResponse;
import com.fisasaude.projeto.sitema_agendamento.feignclient.FeriadoDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Agendamentos", description = "Operacoes de consulta relacionadas a agendamentos")
public interface SwaggerAgendamentoController {

    @Operation(summary = "Listar feriados por ano", description = "Consulta os feriados de um ano informado por meio da integracao com a API externa")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Feriados retornados com sucesso")
    })
    ResponseEntity<List<FeriadoDto>> listarFeriados(
            @Parameter(description = "Ano para consulta dos feriados", example = "2026") @PathVariable Integer ano
    );

    @Operation(summary = "Resumir agendamentos por status no periodo", description = "Retorna a quantidade de agendamentos concluidos, remarcados e cancelados entre dataInicio e dataFim, alem do total somado desses tres status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resumo de agendamentos retornado com sucesso", content = @Content(schema = @Schema(implementation = AgendamentoResumoPeriodoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Periodo invalido ou parametros ausentes", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Periodo semanticamente invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<AgendamentoResumoPeriodoResponseDto> resumirStatusPorPeriodo(
            @Parameter(description = "Data inicial do periodo", example = "2026-01-01")
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataInicio,
            @Parameter(description = "Data final do periodo", example = "2026-01-31")
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate dataFim
    );
}

