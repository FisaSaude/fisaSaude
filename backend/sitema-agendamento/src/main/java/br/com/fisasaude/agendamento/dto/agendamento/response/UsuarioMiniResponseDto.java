package br.com.fisasaude.agendamento.dto.agendamento.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Dados minimos do usuario (instrutor/responsavel) no agendamento")
public record UsuarioMiniResponseDto(
        Integer id,
        String nome
) {}
