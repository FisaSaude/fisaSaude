package br.com.fisasaude.agendamento.dto.authentication;

import br.com.fisasaude.agendamento.model.enums.RoleEnum;

public record LoginResponseDto(
        String token,
        Integer id,
        String nome,
        String email,
        RoleEnum role,
        Integer estabelecimentoId,
        String estabelecimentoNome
) {
}
