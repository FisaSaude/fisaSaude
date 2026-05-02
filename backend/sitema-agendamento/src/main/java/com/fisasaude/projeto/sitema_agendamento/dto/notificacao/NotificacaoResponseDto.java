package com.fisasaude.projeto.sitema_agendamento.dto.notificacao;

import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusNotificacaoEnum;
import com.fisasaude.projeto.sitema_agendamento.model.enums.TipoNotificacaoEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Visao administrativa sucinta de uma notificacao")
public record NotificacaoResponseDto(
        Integer id,
        Integer agendamentoId,
        TipoNotificacaoEnum tipo,
        StatusNotificacaoEnum status,
        Integer tentativas,
        String twilioMessageSid,
        LocalDateTime proximaRetentativa,
        LocalDateTime enviadoEm,
        LocalDateTime criadoEm
) {}
