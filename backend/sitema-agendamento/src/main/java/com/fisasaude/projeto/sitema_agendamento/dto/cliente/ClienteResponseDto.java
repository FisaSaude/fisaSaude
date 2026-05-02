package com.fisasaude.projeto.sitema_agendamento.dto.cliente;

import com.fisasaude.projeto.sitema_agendamento.model.enums.SexoEnum;
import java.time.LocalDate;

public record ClienteResponseDto(
        Integer id,
        String nome,
        String telefone,
        Boolean whatsappAtivo,
        LocalDate dataNascimento,
        SexoEnum sexo,
        String fotoLink
) {
}

