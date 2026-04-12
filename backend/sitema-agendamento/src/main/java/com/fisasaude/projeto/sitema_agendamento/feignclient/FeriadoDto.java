package com.fisasaude.projeto.sitema_agendamento.feignclient;

import java.time.LocalDate;

public record FeriadoDto(
        LocalDate date,
        String name,
        String type
) {
}
