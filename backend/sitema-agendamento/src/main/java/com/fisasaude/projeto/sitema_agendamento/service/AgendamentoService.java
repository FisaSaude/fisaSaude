package com.fisasaude.projeto.sitema_agendamento.service;

import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoResumoPeriodoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.exception.BadRequestException;
import com.fisasaude.projeto.sitema_agendamento.exception.UnprocessableEntityException;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusAgendamentoEnum;
import com.fisasaude.projeto.sitema_agendamento.repository.AgendamentoRepository;
import java.time.LocalDate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;

    public AgendamentoService(AgendamentoRepository agendamentoRepository) {
        this.agendamentoRepository = agendamentoRepository;
    }

    @Transactional(readOnly = true)
    public AgendamentoResumoPeriodoResponseDto obterResumoPorStatusNoPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        validarPeriodo(dataInicio, dataFim);

        long concluidos = agendamentoRepository.countByDataBetweenAndStatus(
                dataInicio,
                dataFim,
                StatusAgendamentoEnum.CONCLUIDO
        );
        long agendados = agendamentoRepository.countByDataBetweenAndStatus(
                dataInicio,
                dataFim,
                StatusAgendamentoEnum.AGENDADO
        );
        long cancelados = agendamentoRepository.countByDataBetweenAndStatus(
                dataInicio,
                dataFim,
                StatusAgendamentoEnum.CANCELADO
        );

        long total = concluidos + agendados + cancelados;

        return new AgendamentoResumoPeriodoResponseDto(concluidos, agendados, cancelados, total);
    }

    private void validarPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        if (dataInicio == null || dataFim == null) {
            throw new BadRequestException("dataInicio e dataFim sao obrigatorias");
        }

        if (dataInicio.isAfter(dataFim)) {
            throw new UnprocessableEntityException("dataInicio nao pode ser maior que dataFim");
        }
    }
}

