package br.com.fisasaude.agendamento.dto.usuario;

import br.com.fisasaude.agendamento.model.enums.RoleEnum;

public record UsuarioResponseDto(
        Integer id,
        String nome,
        String email,
        RoleEnum role,
        Integer estabelecimentoId,
        String estabelecimentoNome
) {
}
