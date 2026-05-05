package br.com.fisasaude.agendamento.dto.notificacao;

import br.com.fisasaude.agendamento.model.enums.StatusNotificacaoEnum;
import br.com.fisasaude.agendamento.model.enums.TipoNotificacaoEnum;
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
