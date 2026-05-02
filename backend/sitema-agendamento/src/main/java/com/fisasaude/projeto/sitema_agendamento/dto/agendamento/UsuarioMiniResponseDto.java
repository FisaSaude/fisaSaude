package com.fisasaude.projeto.sitema_agendamento.dto.agendamento;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados minimos do usuario (instrutor/responsavel) no agendamento")
public record UsuarioMiniResponseDto(
        Integer id,
        String nome
) {}
