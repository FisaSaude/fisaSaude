package br.com.fisasaude.agendamento.dto.agendamento.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Quantidade de agendamentos nao cancelados sobrepostos ao intervalo solicitado para o mesmo usuario")
public record VerificacaoConflitoAgendamentoResponseDto(
        long quantidadeConflitos
) {}
