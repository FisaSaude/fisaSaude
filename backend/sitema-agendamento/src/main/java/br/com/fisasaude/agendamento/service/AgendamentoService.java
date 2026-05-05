package br.com.fisasaude.agendamento.service;

import br.com.fisasaude.agendamento.dto.agendamento.AgendamentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.AgendamentoRemarcarRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.AgendamentoResumoPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.AgendamentoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.HorarioSlotResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.VerificacaoConflitoAgendamentoResponseDto;
import br.com.fisasaude.agendamento.dto.internal.AgendamentoLembreteResponseDto;
import br.com.fisasaude.agendamento.event.AgendamentoNotificacaoConfirmacaoEvent;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.ConflictException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.exception.UnprocessableEntityException;
import br.com.fisasaude.agendamento.mapper.AgendamentoMapper;
import br.com.fisasaude.agendamento.model.entity.Agendamento;
import br.com.fisasaude.agendamento.model.entity.Cliente;
import br.com.fisasaude.agendamento.model.entity.Servico;
import br.com.fisasaude.agendamento.model.entity.Usuario;
import br.com.fisasaude.agendamento.model.enums.RespostaWhatsappTipoEnum;
import br.com.fisasaude.agendamento.model.enums.StatusAgendamentoEnum;
import br.com.fisasaude.agendamento.repository.AgendamentoRepository;
import br.com.fisasaude.agendamento.repository.ClienteRepository;
import br.com.fisasaude.agendamento.repository.ServicoRepository;
import br.com.fisasaude.agendamento.repository.UsuarioRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import br.com.fisasaude.agendamento.integration.notificacao.NotificacaoClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AgendamentoService {

    private static final Logger log = LoggerFactory.getLogger(AgendamentoService.class);
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
    private final NotificacaoClient notificacaoClient;

    public AgendamentoService(
            AgendamentoRepository agendamentoRepository,
            ClienteRepository clienteRepository,
            ServicoRepository servicoRepository,
            UsuarioRepository usuarioRepository,
            AgendamentoMapper agendamentoMapper,
            ApplicationEventPublisher eventPublisher,
            NotificacaoClient notificacaoClient
    ) {
        this.agendamentoRepository = agendamentoRepository;
        this.clienteRepository = clienteRepository;
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.agendamentoMapper = agendamentoMapper;
        this.eventPublisher = eventPublisher;
        this.notificacaoClient = notificacaoClient;
    }

    @Transactional(readOnly = true)
    public AgendamentoResumoPeriodoResponseDto obterResumoPorStatusNoPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        validarPeriodo(dataInicio, dataFim);

        long concluidos = agendamentoRepository.countByDataBetweenAndStatus(
                dataInicio,
                dataFim,
                StatusAgendamentoEnum.CONCLUIDO
        );
        long agendados =
                agendamentoRepository.countByDataBetweenAndStatus(
                        dataInicio, dataFim, StatusAgendamentoEnum.AGENDADO)
                        + agendamentoRepository.countByDataBetweenAndStatus(
                                dataInicio, dataFim, StatusAgendamentoEnum.CONFIRMADO);
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
        notificacaoClient.descartarConfirmacaoElembreteParaAgendamento(id);
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
        notificacaoClient.descartarConfirmacaoElembreteParaAgendamento(id);
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

        notificacaoClient.descartarConfirmacaoElembreteParaAgendamento(id);

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

    @Transactional
    public void aplicarRespostaWhatsappInbound(Integer agendamentoId, RespostaWhatsappTipoEnum tipo) {
        validarIdAgendamento(agendamentoId);
        if (tipo == null) {
            throw new BadRequestException("tipo e obrigatorio");
        }

        Agendamento a = agendamentoRepository
                .findById(agendamentoId)
                .orElseThrow(() -> new NotFoundException("Agendamento nao encontrado"));

        String status = null;

        if (tipo == RespostaWhatsappTipoEnum.SIM) {
            status = StatusAgendamentoEnum.CONFIRMADO.name();
        } else if (tipo == RespostaWhatsappTipoEnum.NAO) {
            status = StatusAgendamentoEnum.CANCELADO.name();
        }

        if (status == null) {
            throw new BadRequestException("tipo de resposta WhatsApp invalido para atualizacao de status");
        }

        if (tipo == RespostaWhatsappTipoEnum.SIM) {
            if (a.getStatus() != StatusAgendamentoEnum.AGENDADO) {
                if (a.getStatus() == StatusAgendamentoEnum.CONFIRMADO) {
                    log.debug("Agendamento {} ja CONFIRMADO; SIM ignorado (duplicidade).", agendamentoId);
                } else {
                    log.debug(
                            "SIM sem efeito em agendamento {} (status {}).",
                            agendamentoId,
                            a.getStatus());
                }
                return;
            }
            int atualizadas = agendamentoRepository.atualizarStatusDireto(agendamentoId, status);
            if (atualizadas > 0) {
                notificacaoClient.descartarSomenteConfirmacaoParaAgendamento(agendamentoId);
                log.info("Agendamento {} -> CONFIRMADO (resposta WhatsApp SIM).", agendamentoId);
            }
            return;
        }

        if (tipo == RespostaWhatsappTipoEnum.NAO) {
            if (a.getStatus() != StatusAgendamentoEnum.AGENDADO
                    && a.getStatus() != StatusAgendamentoEnum.CONFIRMADO) {
                log.debug(
                        "NAO sem efeito em agendamento {} (status {}).",
                        agendamentoId,
                        a.getStatus());
                return;
            }
            int atualizadas = agendamentoRepository.atualizarStatusDireto(agendamentoId, status);
            if (atualizadas > 0) {
                notificacaoClient.descartarConfirmacaoElembreteParaAgendamento(agendamentoId);
                log.info("Agendamento {} -> CANCELADO (resposta WhatsApp NAO).", agendamentoId);
            }
            return;
        }

        log.debug("Tipo de resposta WhatsApp {} sem efeito no status para agendamento {}.", tipo, agendamentoId);
    }

    private void validarIdAgendamento(Integer id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Id do agendamento invalido");
        }
    }

    private void exigeStatusAgendado(Agendamento a) {
        if (a.getStatus() != StatusAgendamentoEnum.AGENDADO
                && a.getStatus() != StatusAgendamentoEnum.CONFIRMADO) {
            throw new UnprocessableEntityException(
                    "Somente agendamentos com status AGENDADO ou CONFIRMADO podem ser alterados nesta operacao."
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
    public List<AgendamentoLembreteResponseDto> listarConfirmadosParaLembrete(LocalDate data) {
        if (data == null) {
            throw new BadRequestException("data e obrigatoria");
        }
        return agendamentoRepository.findAgendamentosParaLembrete(data, StatusAgendamentoEnum.CONFIRMADO).stream()
                .map(a -> new AgendamentoLembreteResponseDto(
                        a.getId(),
                        a.getCliente().getTelefone(),
                        a.getHoraInicio()))
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
