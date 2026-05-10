package br.com.fisasaude.agendamento.dto.agendamento.response;

import br.com.fisasaude.agendamento.model.enums.StatusAgendamentoEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Schema(description = "Agendamento com relacionamentos para leitura")
public record AgendamentoResponseDto(
        Integer id,
        LocalDate data,
        LocalTime horaInicio,
        LocalTime horaFim,
        StatusAgendamentoEnum status,
        String observacoes,
        LocalDateTime criadoEm,
        LocalDateTime atualizadoEm,
        ClienteMiniResponseDto cliente,
        ServicoMiniResponseDto servico,
        UsuarioMiniResponseDto usuario
) {}
