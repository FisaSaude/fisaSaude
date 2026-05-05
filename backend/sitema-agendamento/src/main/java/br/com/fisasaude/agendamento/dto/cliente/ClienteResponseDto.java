package br.com.fisasaude.agendamento.dto.cliente;

import br.com.fisasaude.agendamento.model.enums.SexoEnum;
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

