package com.fisasaude.projeto.sitema_agendamento.dto.usuario;

import com.fisasaude.projeto.sitema_agendamento.model.enums.RoleEnum;

public record UsuarioResponseDto(
        Integer id,
        String nome,
        String email,
        RoleEnum role,
        Integer estabelecimentoId,
        String estabelecimentoNome
) {
}
