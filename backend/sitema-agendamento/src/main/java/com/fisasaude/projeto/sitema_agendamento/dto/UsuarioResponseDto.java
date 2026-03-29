package com.fisasaude.projeto.sitema_agendamento.dto;

public record UsuarioResponseDto(
        Integer id,
        String nome,
        String email,
        Integer estabelecimentoId,
        String estabelecimentoNome
) {
}

