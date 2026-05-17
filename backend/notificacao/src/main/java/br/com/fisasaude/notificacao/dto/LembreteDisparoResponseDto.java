package br.com.fisasaude.notificacao.dto;

import java.time.LocalDate;
import java.util.List;

public record LembreteDisparoResponseDto(
        LocalDate dataAtendimento,
        int totalElegiveis,
        int enviados,
        int falhas,
        List<Integer> agendamentoIdsEnviados) {}
