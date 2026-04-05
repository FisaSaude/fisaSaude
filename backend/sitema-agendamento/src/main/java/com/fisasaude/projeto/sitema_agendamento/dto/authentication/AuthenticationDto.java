package com.fisasaude.projeto.sitema_agendamento.dto.authentication;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthenticationDto(
        @NotBlank
        @Email
        String email,
        @NotBlank
        String senha
) {
}
