package br.com.fisasaude.agendamento.dto.agendamento;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados minimos do cliente no contexto do agendamento")
public record ClienteMiniResponseDto(
        Integer id,
        String nome,
        String telefone
) {}
