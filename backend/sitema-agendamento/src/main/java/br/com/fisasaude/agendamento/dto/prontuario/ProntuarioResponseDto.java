package br.com.fisasaude.agendamento.dto.prontuario;

import java.time.LocalDateTime;

public record ProntuarioResponseDto(
    Integer id,
    String observacoes,
    LocalDateTime criadoEm,
    Integer clienteId
) {}

