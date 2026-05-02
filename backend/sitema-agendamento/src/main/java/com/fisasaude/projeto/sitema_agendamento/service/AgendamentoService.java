package com.fisasaude.projeto.sitema_agendamento.service;

import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoCreateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoRemarcarRequestDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoResumoPeriodoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.HorarioSlotResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.VerificacaoConflitoAgendamentoResponseDto;
import com.fisasaude.projeto.sitema_agendamento.event.AgendamentoNotificacaoConfirmacaoEvent;
import com.fisasaude.projeto.sitema_agendamento.exception.BadRequestException;
import com.fisasaude.projeto.sitema_agendamento.exception.ConflictException;
import com.fisasaude.projeto.sitema_agendamento.exception.NotFoundException;
import com.fisasaude.projeto.sitema_agendamento.exception.UnprocessableEntityException;
import com.fisasaude.projeto.sitema_agendamento.mapper.AgendamentoMapper;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Agendamento;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Cliente;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Servico;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Usuario;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusAgendamentoEnum;
import com.fisasaude.projeto.sitema_agendamento.repository.AgendamentoRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.ClienteRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.ServicoRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendamentoService {

    private static final ZoneId ZONA_APP = ZoneId.of("America/Sao_Paulo");
    private static final int SLOT_STEP_MINUTES = 15;
    private static final int DURACAO_SLOT_MIN = 15;
    private static final int DURACAO_SLOT_MAX = 480;

    private final AgendamentoRepository agendamentoRepository;
    private final ClienteRepository clienteRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AgendamentoMapper agendamentoMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificacaoDispatchService notificacaoDispatchService;

    public AgendamentoService(
            AgendamentoRepository agendamentoRepository,
            ClienteRepository clienteRepository,
            ServicoRepository servicoRepository,
            UsuarioRepository usuarioRepository,
            AgendamentoMapper agendamentoMapper,
            ApplicationEventPublisher eventPublisher,
            NotificacaoDispatchService notificacaoDispatchService
    ) {
        this.agendamentoRepository = agendamentoRepository;
        this.clienteRepository = clienteRepository;
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.agendamentoMapper = agendamentoMapper;
        this.eventPublisher = eventPublisher;
        this.notificacaoDispatchService = notificacaoDispatchService;
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

    @Transactional
    public AgendamentoResponseDto criar(AgendamentoCreateRequestDto dto) {
        if (dto == null) {
            throw new BadRequestException("Corpo da requisicao nao pode ser nulo");
        }

        Cliente cliente = clienteRepository
                .findById(dto.clienteId())
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado"));
        Servico servico = servicoRepository
                .findById(dto.servicoId())
                .orElseThrow(() -> new NotFoundException("Servico nao encontrado"));
        Usuario usuario = usuarioRepository
                .findById(dto.usuarioId())
                .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));

        LocalDate data = dto.data();
        LocalTime horaInicio = dto.horaInicio();
        LocalTime horaFim = dto.horaFim();

        validarIntervaloHorario(horaInicio, horaFim);
        validarInicioFuturo(data, horaInicio);

        long conflitos = agendamentoRepository.countAgendamentosConflitantes(
                dto.usuarioId(),
                data,
                horaInicio,
                horaFim,
                null,
                StatusAgendamentoEnum.CANCELADO
        );
        if (conflitos > 0) {
            throw new ConflictException("Ja existe agendamento nao cancelado neste intervalo para o profissional");
        }

        LocalDateTime now = LocalDateTime.now(ZONA_APP);

        Agendamento a = new Agendamento();
        a.setData(data);
        a.setHoraInicio(horaInicio);
        a.setHoraFim(horaFim);
        a.setStatus(StatusAgendamentoEnum.AGENDADO);
        a.setObservacoes(trimToNull(dto.observacoes()));
        a.setCriadoEm(now);
        a.setAtualizadoEm(now);
        a.setCliente(cliente);
        a.setServico(servico);
        a.setUsuario(usuario);

        Agendamento salvo = agendamentoRepository.save(a);
        eventPublisher.publishEvent(new AgendamentoNotificacaoConfirmacaoEvent(salvo.getId()));
        return agendamentoMapper.toDto(salvo);
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDto buscarPorId(Integer id) {
        validarIdAgendamento(id);
        Agendamento a = agendamentoRepository
                .findByIdWithRelations(id)
                .orElseThrow(() -> new NotFoundException("Agendamento nao encontrado"));
        return agendamentoMapper.toDto(a);
    }

    @Transactional
    public AgendamentoResponseDto cancelar(Integer id) {
        validarIdAgendamento(id);
        Agendamento a = agendamentoRepository
                .findByIdWithRelations(id)
                .orElseThrow(() -> new NotFoundException("Agendamento nao encontrado"));
        exigeStatusAgendado(a);
        notificacaoDispatchService.descartarConfirmacaoElembreteParaAgendamento(id);
        a.setStatus(StatusAgendamentoEnum.CANCELADO);
        a.setAtualizadoEm(LocalDateTime.now(ZONA_APP));
        return agendamentoMapper.toDto(agendamentoRepository.save(a));
    }

    @Transactional
    public AgendamentoResponseDto concluir(Integer id) {
        validarIdAgendamento(id);
        Agendamento a = agendamentoRepository
                .findByIdWithRelations(id)
                .orElseThrow(() -> new NotFoundException("Agendamento nao encontrado"));
        exigeStatusAgendado(a);
        notificacaoDispatchService.descartarConfirmacaoElembreteParaAgendamento(id);
        a.setStatus(StatusAgendamentoEnum.CONCLUIDO);
        a.setAtualizadoEm(LocalDateTime.now(ZONA_APP));
        return agendamentoMapper.toDto(agendamentoRepository.save(a));
    }

    @Transactional
    public AgendamentoResponseDto remarcar(Integer id, AgendamentoRemarcarRequestDto dto) {
        validarIdAgendamento(id);
        if (dto == null) {
            throw new BadRequestException("Corpo da requisicao nao pode ser nulo");
        }

        Agendamento a = agendamentoRepository
                .findByIdWithRelations(id)
                .orElseThrow(() -> new NotFoundException("Agendamento nao encontrado"));
        exigeStatusAgendado(a);

        notificacaoDispatchService.descartarConfirmacaoElembreteParaAgendamento(id);

        LocalDate data = dto.data();
        LocalTime horaInicio = dto.horaInicio();
        LocalTime horaFim = dto.horaFim();

        validarIntervaloHorario(horaInicio, horaFim);
        validarInicioFuturo(data, horaInicio);

        Usuario usuarioAlvo = a.getUsuario();
        if (dto.usuarioId() != null) {
            Usuario candidato = usuarioRepository
                    .findById(dto.usuarioId())
                    .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));
            if (!mesmoEstabelecimento(a.getUsuario(), candidato)) {
                throw new UnprocessableEntityException(
                        "O novo usuario deve pertencer ao mesmo estabelecimento do agendamento atual"
                );
            }
            usuarioAlvo = candidato;
        }

        Servico servicoAlvo = a.getServico();
        if (dto.servicoId() != null) {
            servicoAlvo = servicoRepository.findById(dto.servicoId()).orElseThrow(() -> new NotFoundException("Servico nao encontrado"));
        }

        long conflitos = agendamentoRepository.countAgendamentosConflitantes(
                usuarioAlvo.getId(),
                data,
                horaInicio,
                horaFim,
                id,
                StatusAgendamentoEnum.CANCELADO
        );
        if (conflitos > 0) {
            throw new ConflictException("Ja existe agendamento nao cancelado neste intervalo para o profissional");
        }

        a.setData(data);
        a.setHoraInicio(horaInicio);
        a.setHoraFim(horaFim);
        a.setUsuario(usuarioAlvo);
        a.setServico(servicoAlvo);
        a.setAtualizadoEm(LocalDateTime.now(ZONA_APP));

        Agendamento salvoRemarcacao = agendamentoRepository.save(a);
        eventPublisher.publishEvent(new AgendamentoNotificacaoConfirmacaoEvent(salvoRemarcacao.getId()));
        return agendamentoMapper.toDto(salvoRemarcacao);
    }

    private void validarIdAgendamento(Integer id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Id do agendamento invalido");
        }
    }

    private void exigeStatusAgendado(Agendamento a) {
        if (a.getStatus() != StatusAgendamentoEnum.AGENDADO) {
            throw new UnprocessableEntityException(
                    "Somente agendamentos com status AGENDADO podem ser alterados nesta operacao."
            );
        }
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDto> listarPorStatusEPeriodo(
            StatusAgendamentoEnum status,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        if (status == null) {
            throw new BadRequestException("status e obrigatorio");
        }
        validarPeriodo(dataInicio, dataFim);
        return agendamentoRepository
                .findByStatusAndDataBetweenOrderByDataAscHoraInicioAsc(status, dataInicio, dataFim)
                .stream()
                .map(agendamentoMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDto> listarPorCliente(Integer clienteId) {
        if (clienteId == null) {
            throw new BadRequestException("clienteId e obrigatorio");
        }
        return agendamentoRepository.findByClienteIdWithDetails(clienteId).stream()
                .map(agendamentoMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDto> listarParaLembrete(LocalDate data, StatusAgendamentoEnum status) {
        if (data == null) {
            throw new BadRequestException("data e obrigatoria");
        }
        StatusAgendamentoEnum usado = status != null ? status : StatusAgendamentoEnum.AGENDADO;
        return agendamentoRepository.findAgendamentosParaLembrete(data, usado).stream()
                .map(agendamentoMapper::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public VerificacaoConflitoAgendamentoResponseDto verificarConflitoHorario(
            Integer usuarioId,
            LocalDate data,
            LocalTime horaInicio,
            LocalTime horaFim,
            Integer excludeAgendamentoId
    ) {
        if (usuarioId == null) {
            throw new BadRequestException("usuarioId e obrigatorio");
        }
        if (data == null) {
            throw new BadRequestException("data e obrigatoria");
        }
        validarIntervaloHorario(horaInicio, horaFim);

        long n = agendamentoRepository.countAgendamentosConflitantes(
                usuarioId,
                data,
                horaInicio,
                horaFim,
                excludeAgendamentoId,
                StatusAgendamentoEnum.CANCELADO
        );
        return new VerificacaoConflitoAgendamentoResponseDto(n);
    }

    @Transactional(readOnly = true)
    public List<HorarioSlotResponseDto> listarSlotsDisponiveis(Integer usuarioId, LocalDate data, Integer duracaoMinutos) {
        if (usuarioId == null) {
            throw new BadRequestException("usuarioId e obrigatorio");
        }
        if (data == null) {
            throw new BadRequestException("data e obrigatoria");
        }
        int dur = duracaoMinutos != null ? duracaoMinutos : 60;
        if (dur < DURACAO_SLOT_MIN || dur > DURACAO_SLOT_MAX) {
            throw new UnprocessableEntityException(
                    "duracaoMinutos deve estar entre " + DURACAO_SLOT_MIN + " e " + DURACAO_SLOT_MAX
            );
        }

        Usuario u = usuarioRepository.findById(usuarioId).orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));
        LocalTime diaInicio = u.getEstabelecimento().getInicioFuncionamento();
        LocalTime diaFim = u.getEstabelecimento().getFimFuncionamento();

        if (!diaInicio.isBefore(diaFim)) {
            throw new UnprocessableEntityException("Horario de funcionamento do estabelecimento invalido");
        }

        List<HorarioSlotResponseDto> resultado = new ArrayList<>();
        for (LocalTime candidato = diaInicio; !candidato.plusMinutes(dur).isAfter(diaFim); candidato = candidato.plusMinutes(SLOT_STEP_MINUTES)) {
            LocalTime hi = candidato;
            LocalTime hf = candidato.plusMinutes(dur);
            if (!inicioSlotNoFuturo(data, hi)) {
                continue;
            }
            long c = agendamentoRepository.countAgendamentosConflitantes(
                    usuarioId,
                    data,
                    hi,
                    hf,
                    null,
                    StatusAgendamentoEnum.CANCELADO
            );
            if (c == 0) {
                resultado.add(new HorarioSlotResponseDto(hi, hf));
            }
        }
        return resultado;
    }

    private boolean mesmoEstabelecimento(Usuario atual, Usuario outro) {
        return atual.getEstabelecimento().getId().equals(outro.getEstabelecimento().getId());
    }

    private boolean inicioSlotNoFuturo(LocalDate data, LocalTime horaInicio) {
        ZonedDateTime inicio = ZonedDateTime.of(data, horaInicio, ZONA_APP);
        return inicio.isAfter(ZonedDateTime.now(ZONA_APP));
    }

    private void validarInicioFuturo(LocalDate data, LocalTime horaInicio) {
        ZonedDateTime inicio = ZonedDateTime.of(data, horaInicio, ZONA_APP);
        ZonedDateTime agora = ZonedDateTime.now(ZONA_APP);
        if (!inicio.isAfter(agora)) {
            throw new UnprocessableEntityException("Data e hora de inicio devem ser posteriores ao momento atual");
        }
    }

    private static String trimToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }

    private void validarPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        if (dataInicio == null || dataFim == null) {
            throw new BadRequestException("dataInicio e dataFim sao obrigatorias");
        }

        if (dataInicio.isAfter(dataFim)) {
            throw new UnprocessableEntityException("dataInicio nao pode ser maior que dataFim");
        }
    }

    private void validarIntervaloHorario(LocalTime horaInicio, LocalTime horaFim) {
        if (horaInicio == null || horaFim == null) {
            throw new BadRequestException("horaInicio e horaFim sao obrigatorias");
        }
        if (!horaInicio.isBefore(horaFim)) {
            throw new UnprocessableEntityException("horaInicio deve ser menor que horaFim");
        }
    }
}
