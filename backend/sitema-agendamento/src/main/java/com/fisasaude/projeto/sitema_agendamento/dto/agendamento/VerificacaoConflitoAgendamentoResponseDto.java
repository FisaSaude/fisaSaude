package com.fisasaude.projeto.sitema_agendamento.dto.agendamento;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Quantidade de agendamentos nao cancelados sobrepostos ao intervalo solicitado para o mesmo usuario")
public record VerificacaoConflitoAgendamentoResponseDto(
        long quantidadeConflitos
) {}
