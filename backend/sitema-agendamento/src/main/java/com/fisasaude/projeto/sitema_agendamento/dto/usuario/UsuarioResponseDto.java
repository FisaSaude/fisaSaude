package com.fisasaude.projeto.sitema_agendamento.dto.usuario;

public record UsuarioResponseDto(
        Integer id,
        String nome,
        String email,
        Integer estabelecimentoId,
        String estabelecimentoNome
) {
}

