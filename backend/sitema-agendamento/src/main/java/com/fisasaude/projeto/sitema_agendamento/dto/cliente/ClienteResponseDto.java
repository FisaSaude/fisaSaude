package com.fisasaude.projeto.sitema_agendamento.dto.cliente;

import com.fisasaude.projeto.sitema_agendamento.model.SexoEnum;
import java.time.LocalDate;

public record ClienteResponseDto(
        Integer id,
        String nome,
        String telefone,
        LocalDate dataNascimento,
        SexoEnum sexo,
        String fotoLink
) {
}

