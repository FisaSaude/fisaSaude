package com.fisasaude.projeto.sitema_agendamento.service;

import com.fisasaude.projeto.sitema_agendamento.dto.notificacao.NotificacaoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.exception.BadRequestException;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Notificacao;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusNotificacaoEnum;
import com.fisasaude.projeto.sitema_agendamento.repository.NotificacaoRepository;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;

    public NotificacaoService(NotificacaoRepository notificacaoRepository) {
        this.notificacaoRepository = notificacaoRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponseDto> listarPendentesOrdenadas() {
        List<Notificacao> todas = notificacaoRepository.findByStatus(StatusNotificacaoEnum.PENDENTE);
        return todas.stream()
                .sorted(Comparator.comparing(Notificacao::getProximaRetentativa, Comparator.nullsLast(LocalDateTime::compareTo)).thenComparing(Notificacao::getCriadoEm))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponseDto> listarFalhasParaRetry(int tentativasMaximasExclusivo) {
        if (tentativasMaximasExclusivo <= 0) {
            throw new BadRequestException("tentativasMaximas deve ser maior que zero");
        }
        return notificacaoRepository
                .findByStatusAndTentativasLessThan(StatusNotificacaoEnum.FALHOU, tentativasMaximasExclusivo)
                .stream()
                .sorted(Comparator.comparing(Notificacao::getProximaRetentativa, Comparator.nullsLast(LocalDateTime::compareTo)).thenComparing(Notificacao::getCriadoEm))
                .map(this::toDto)
                .toList();
    }

    private NotificacaoResponseDto toDto(Notificacao n) {
        return new NotificacaoResponseDto(
                n.getId(),
                n.getAgendamento() != null ? n.getAgendamento().getId() : null,
                n.getTipo(),
                n.getStatus(),
                n.getTentativas(),
                n.getTwilioMessageSid(),
                n.getProximaRetentativa(),
                n.getEnviadoEm(),
                n.getCriadoEm()
        );
    }
}
