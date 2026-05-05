package br.com.fisasaude.agendamento.feignclient;

import java.time.LocalDate;

public record FeriadoDto(
        LocalDate date,
        String name,
        String type
) {
}
