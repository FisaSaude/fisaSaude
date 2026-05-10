package br.com.fisasaude.agendamento.controller.agendamento;

import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoBloquearDiaRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoRemarcarRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoUsuarioPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.DiaValidoPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.HorarioSlotResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoResumoPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.TaxaOcupacaoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.VerificacaoConflitoAgendamentoResponseDto;
import br.com.fisasaude.agendamento.exception.ErrorResponse;
import br.com.fisasaude.agendamento.feignclient.FeriadoDto;
import br.com.fisasaude.agendamento.model.enums.StatusAgendamentoEnum;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@Tag(name = "Agendamentos", description = "Criacao e consultas de agendamentos, feriados e resumos")
public interface SwaggerAgendamentoController {

    @Operation(
            summary = "Criar agendamento",
            description = "Cria compromisso com status AGENDADO; valida entidades referenciadas, inicio futuro e choque de horario do profissional."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Criado",
                    content = @Content(schema = @Schema(implementation = AgendamentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Validacao", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "404", description = "Cliente, servico ou usuario nao encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflito de horario ou restricao unique",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Regra semantica violada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<AgendamentoResponseDto> criar(@Valid @RequestBody AgendamentoCreateRequestDto dto);

    @Operation(summary = "Buscar agendamento por id", description = "Retorna o registro com cliente, servico e usuario (JOIN FETCH).")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Encontrado",
                    content = @Content(schema = @Schema(implementation = AgendamentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "404", description = "Nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<AgendamentoResponseDto> buscarPorId(
            @Parameter(description = "ID do agendamento", required = true, example = "1") @PathVariable Integer id
    );

    @Operation(summary = "Cancelar agendamento", description = "Altera status para CANCELADO apenas se o atual for AGENDADO.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Cancelado",
                    content = @Content(schema = @Schema(implementation = AgendamentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "404", description = "Nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Status nao permite esta acao", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<AgendamentoResponseDto> cancelar(
            @Parameter(description = "ID do agendamento", required = true, example = "1") @PathVariable Integer id
    );

    @Operation(summary = "Concluir agendamento", description = "Altera status para CONCLUIDO apenas se o atual for AGENDADO.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Concluido",
                    content = @Content(schema = @Schema(implementation = AgendamentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "404", description = "Nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Status nao permite esta acao", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<AgendamentoResponseDto> concluir(
            @Parameter(description = "ID do agendamento", required = true, example = "1") @PathVariable Integer id
    );

    @Operation(
            summary = "Remarcar agendamento",
            description = "Mantem status AGENDADO e atualiza data/horario e, opcionalmente, usuario (mesmo estabelecimento) e servico. Valida intervalo, inicio futuro e conflitos excluindo o proprio agendamento."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Remarcado",
                    content = @Content(schema = @Schema(implementation = AgendamentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Validacao", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "404", description = "Agendamento, usuario ou servico nao encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflito de horario",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Regra semantica violada",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<AgendamentoResponseDto> remarcar(
            @Parameter(description = "ID do agendamento", required = true, example = "1") @PathVariable Integer id,
            @Valid @RequestBody AgendamentoRemarcarRequestDto dto
    );

    @Operation(
            summary = "Listar agendamentos por status e periodo",
            description = "Retorna agendamentos filtrados por status e intervalo de datas (inclusivo), com cliente, servico e usuario carregados."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = AgendamentoResponseDto.class)))),
            @ApiResponse(responseCode = "400", description = "Parametro obrigatorio ausente", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "422", description = "Periodo invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<AgendamentoResponseDto>> listarPorStatusEPeriodo(
            @Parameter(description = "Status do agendamento", required = true) @RequestParam StatusAgendamentoEnum status,
            @Parameter(description = "Data inicial (inclusive)", required = true, example = "2026-05-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Data final (inclusive)", required = true, example = "2026-05-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    );

    @Operation(
            summary = "Listar agendamentos por cliente",
            description = "Retorna todos os agendamentos do cliente com relacionamentos para exibicao."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = AgendamentoResponseDto.class)))),
            @ApiResponse(responseCode = "400", description = "ID invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao")
    })
    ResponseEntity<List<AgendamentoResponseDto>> listarPorCliente(
            @Parameter(description = "ID do cliente", required = true, example = "1") @PathVariable Integer clienteId
    );

    @Operation(
            summary = "Agendamentos candidatos a lembrete",
            description = "Lista agendamentos de uma data e status usuais para notificacao (default de status: AGENDADO)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = AgendamentoResponseDto.class)))),
            @ApiResponse(responseCode = "400", description = "Data obrigatoria", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao")
    })
    ResponseEntity<List<AgendamentoResponseDto>> listarParaLembrete(
            @Parameter(description = "Data alvo do lembrete", required = true, example = "2026-05-03") @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Parameter(description = "Opcional; padrao AGENDADO") @RequestParam(required = false)
            StatusAgendamentoEnum status
    );

    @Operation(
            summary = "Verificar conflito de horario por usuario",
            description = "Conta quantos agendamentos nao cancelados se sobrepoe ao intervalo no mesmo dia para o mesmo usuario."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Verificacao concluida", content = @Content(schema = @Schema(implementation = VerificacaoConflitoAgendamentoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Parametros invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "422", description = "Intervalo de horario invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<VerificacaoConflitoAgendamentoResponseDto> verificarConflitoHorario(
            @Parameter(required = true) @RequestParam Integer usuarioId,
            @Parameter(required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Parameter(required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaInicio,
            @Parameter(required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime horaFim,
            @Parameter(description = "Exclui um agendamento na checagem (ex.: edicao)") @RequestParam(required = false) Integer excludeAgendamentoId
    );

    @Operation(
            summary = "Listar slots de disponibilidade por usuario",
            description = "Gera candidatos em passos fixos dentro do expediente do estabelecimento do usuario, exclui intervalos com agendamentos nao cancelados e apenas inicios no futuro (America/Sao_Paulo)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de intervalos disponiveis",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = HorarioSlotResponseDto.class)))),
            @ApiResponse(responseCode = "400", description = "Parametros invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "404", description = "Usuario nao encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Duracao ou expediente invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<HorarioSlotResponseDto>> slotsDisponiveis(
            @Parameter(description = "Usuario (profissional)", required = true) @RequestParam Integer usuarioId,
            @Parameter(description = "Data alvo", required = true, example = "2026-05-03") @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate data,
            @Parameter(description = "Duracao em minutos; padrao 60; entre 15 e 480")
            @RequestParam(required = false, defaultValue = "60") Integer duracaoMinutos
    );

    @Operation(summary = "Listar feriados por ano", description = "Integracao Brasil API / configuracao configurada pela aplicacao.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Feriados retornados com sucesso",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = FeriadoDto.class)))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao")
    })
    ResponseEntity<List<FeriadoDto>> listarFeriados(
            @Parameter(description = "Ano", example = "2026") @PathVariable Integer ano
    );

    @Operation(summary = "Resumo de agendamentos por status no periodo", description = "Totais de concluidos, agendados, cancelados e soma no intervalo.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resumo calculado", content = @Content(schema = @Schema(implementation = AgendamentoResumoPeriodoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Parametros ausentes ou invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "422", description = "Periodo invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<AgendamentoResumoPeriodoResponseDto> resumirStatusPorPeriodo(
            @Parameter(description = "Inicio do periodo", example = "2026-01-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Fim do periodo", example = "2026-01-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    );

    @Operation(
            summary = "Listar agendamentos por usuario em um periodo",
            description = "Retorna hora de inicio, nome do cliente, status e preco para o usuario no intervalo informado (inclusivo)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = AgendamentoUsuarioPeriodoResponseDto.class)))),
            @ApiResponse(responseCode = "400", description = "Parametro obrigatorio ausente", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "422", description = "Periodo invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<AgendamentoUsuarioPeriodoResponseDto>> listarPorUsuarioEPeriodo(
            @Parameter(description = "ID do usuario (profissional)", required = true, example = "1") @RequestParam Integer usuarioId,
            @Parameter(description = "Data inicial (inclusive)", required = true, example = "2026-05-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Data final (inclusive)", required = true, example = "2026-05-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    );

    @Operation(
            summary = "Listar dias disponiveis por periodo",
            description = "Retorna todos os dias do intervalo com indicacao se o dia esta disponivel (nao sabado/domingo, nao feriado e com slots disponiveis)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista retornada com sucesso",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = DiaValidoPeriodoResponseDto.class)))),
            @ApiResponse(responseCode = "400", description = "Parametros ausentes", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou invalido"),
            @ApiResponse(responseCode = "403", description = "Sem permissao"),
            @ApiResponse(responseCode = "422", description = "Periodo invalido", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<List<DiaValidoPeriodoResponseDto>> listarDiasValidos(
            @Parameter(description = "ID do usuario (profissional)", required = true, example = "1")
            @RequestParam Integer usuarioId,
            @Parameter(description = "Inicio do periodo", required = true, example = "2026-05-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Fim do periodo", required = true, example = "2026-05-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim
    );

    @Operation(
        summary = "Bloquear um dia inteiro para agendamentos",
        description = "Cria um bloqueio de agenda para um dia inteiro para um usuário/profissional, impedindo novos agendamentos nesta data."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Dia bloqueado com sucesso", content = @Content(schema = @Schema(implementation = AgendamentoResponseDto.class))),
        @ApiResponse(responseCode = "400", description = "Dados inválidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<AgendamentoResponseDto> bloquearDia(@Valid @RequestBody AgendamentoBloquearDiaRequestDto dto);

    @Operation(
            summary = "Taxa de ocupação por periodo",
            description = "Calcula a taxa de ocupação de um profissional no período informado: " +
                    "(total de agendamentos efetivos / capacidade máxima de slots) × 100. " +
                    "A capacidade é calculada com base nos dias úteis (excluindo fins de semana e feriados nacionais) " +
                    "e no horário de funcionamento do estabelecimento dividido pela duração do slot. " +
                    "Agendamentos com status CANCELADO e BLOQUEADO são excluídos da contagem efetiva."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Taxa calculada com sucesso",
                    content = @Content(schema = @Schema(implementation = TaxaOcupacaoResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Parâmetros ausentes ou inválidos",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Token ausente ou inválido"),
            @ApiResponse(responseCode = "403", description = "Sem permissão"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "422", description = "Período ou duração inválida",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<TaxaOcupacaoResponseDto> taxaOcupacao(
            @Parameter(description = "ID do usuário (profissional)", required = true, example = "1")
            @RequestParam Integer usuarioId,
            @Parameter(description = "Início do período (inclusive)", required = true, example = "2026-05-01")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataInicio,
            @Parameter(description = "Fim do período (inclusive)", required = true, example = "2026-05-31")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dataFim,
            @Parameter(description = "Duração do slot em minutos (padrão 60, entre 15 e 480)")
            @RequestParam(required = false, defaultValue = "60") Integer duracaoMinutos
    );
}
