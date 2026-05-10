package br.com.fisasaude.agendamento.dto.agendamento.response;

import br.com.fisasaude.agendamento.model.enums.StatusAgendamentoEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalTime;

@Schema(description = "Resumo de agendamento por usuario em um periodo")
public record AgendamentoUsuarioPeriodoResponseDto(
        LocalTime horaInicio,
        String nomeCliente,
        StatusAgendamentoEnum status,
        BigDecimal preco
) {}

