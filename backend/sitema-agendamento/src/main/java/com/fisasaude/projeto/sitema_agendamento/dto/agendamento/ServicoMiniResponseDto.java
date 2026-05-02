package com.fisasaude.projeto.sitema_agendamento.dto.agendamento;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "Dados minimos do servico no contexto do agendamento")
public record ServicoMiniResponseDto(
        Integer id,
        String nome,
        String tipo,
        BigDecimal preco
) {}
