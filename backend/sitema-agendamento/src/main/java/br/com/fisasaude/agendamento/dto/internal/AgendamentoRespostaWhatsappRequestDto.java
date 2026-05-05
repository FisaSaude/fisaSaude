package br.com.fisasaude.agendamento.dto.internal;

import br.com.fisasaude.agendamento.model.enums.RespostaWhatsappTipoEnum;
import jakarta.validation.constraints.NotNull;

public record AgendamentoRespostaWhatsappRequestDto(@NotNull RespostaWhatsappTipoEnum tipo) {}
