package br.com.fisasaude.agendamento.dto.authentication;

public record LoginResponseDto(
        String token,
        Integer id,
        String nome,
        String email,
        Integer estabelecimentoId,
        String estabelecimentoNome
) {
}
