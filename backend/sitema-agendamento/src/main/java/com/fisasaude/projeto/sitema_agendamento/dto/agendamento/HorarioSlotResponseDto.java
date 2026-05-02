package com.fisasaude.projeto.sitema_agendamento.dto.agendamento;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalTime;

@Schema(description = "Janela livre dentro do expediente do estabelecimento do usuario.")
public record HorarioSlotResponseDto(
        LocalTime horaInicio,
        LocalTime horaFim
) {}
