package br.com.fisasaude.agendamento.service;

import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoBloquearPeriodoRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoRemarcarRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoUsuarioPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.DiaValidoPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.HorarioSlotResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.TaxaOcupacaoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.VerificacaoConflitoAgendamentoResponseDto;
import br.com.fisasaude.agendamento.dto.internal.AgendamentoLembreteResponseDto;
import br.com.fisasaude.agendamento.event.AgendamentoNotificacaoConfirmacaoEvent;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.ConflictException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.integration.notificacao.NotificacaoClient;
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
import br.com.fisasaude.agendamento.service.port.FeriadosPort;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
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
    private static final int DURACAO_PADRAO_MIN = 60;
    private static final int DURACAO_SLOT_MIN = 15;
    private static final int DURACAO_SLOT_MAX = 480;
    private static final String MSG_CLIENTE_NAO_ENCONTRADO = "Cliente nao encontrado";
    private static final String MSG_SERVICO_NAO_ENCONTRADO = "Servico nao encontrado";
    private static final String MSG_USUARIO_NAO_ENCONTRADO = "Usuario nao encontrado";
    private static final String MSG_AGENDAMENTO_NAO_ENCONTRADO = "Agendamento nao encontrado";
    private static final String MSG_CONFLITO_INTERVALO =
            "Ja existe agendamento nao cancelado neste intervalo para o profissional";
    private static final String MSG_HORARIO_FUNCIONAMENTO_INVALIDO =
            "Horario de funcionamento do estabelecimento invalido";
    private static final String OBSERVACAO_BLOQUEIO_PERIODO = "BLOQUEIO DE PERIODO";

    private final AgendamentoRepository agendamentoRepository;
    private final ClienteRepository clienteRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AgendamentoMapper agendamentoMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final NotificacaoClient notificacaoClient;
    private final FeriadosPort feriadosPort;

    public AgendamentoService(
            AgendamentoRepository agendamentoRepository,
            ClienteRepository clienteRepository,
            ServicoRepository servicoRepository,
            UsuarioRepository usuarioRepository,
            AgendamentoMapper agendamentoMapper,
            ApplicationEventPublisher eventPublisher,
            NotificacaoClient notificacaoClient,
            FeriadosPort feriadosPort
    ) {
        this.agendamentoRepository = agendamentoRepository;
        this.clienteRepository = clienteRepository;
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.agendamentoMapper = agendamentoMapper;
        this.eventPublisher = eventPublisher;
        this.notificacaoClient = notificacaoClient;
        this.feriadosPort = feriadosPort;
    }

    @Transactional
    public AgendamentoResponseDto criar(AgendamentoCreateRequestDto dto) {
        if (dto == null) {
            throw new BadRequestException("Corpo da requisicao nao pode ser nulo");
        }

        Cliente cliente = buscarClientePorId(dto.clienteId());
        Servico servico = buscarServicoPorId(dto.servicoId());
        Usuario usuario = buscarUsuarioPorId(dto.usuarioId());

        LocalDate data = dto.data();
        LocalTime horaInicio = dto.horaInicio();
        LocalTime horaFim = dto.horaFim();

        validarIntervaloHorario(horaInicio, horaFim);
        validarInicioFuturo(data, horaInicio);
        validarSemConflitoHorario(usuario.getId(), data, horaInicio, horaFim, null);

        Agendamento agendamento = novoAgendamento(dto, cliente, servico, usuario);
        Agendamento salvo = agendamentoRepository.save(agendamento);
        publicarEventoConfirmacao(salvo.getId());
        return agendamentoMapper.toDto(salvo);
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDto buscarPorId(Integer id) {
        validarIdAgendamento(id);
        return agendamentoMapper.toDto(buscarAgendamentoComRelacionamentosPorId(id));
    }

    @Transactional
    public AgendamentoResponseDto cancelar(Integer id) {
        validarIdAgendamento(id);
        Agendamento agendamento = buscarAgendamentoComRelacionamentosPorId(id);
        exigeStatusAgendado(agendamento);
        notificacaoClient.descartarConfirmacaoElembreteParaAgendamento(id);
        atualizarStatus(agendamento, StatusAgendamentoEnum.CANCELADO);
        return agendamentoMapper.toDto(agendamentoRepository.save(agendamento));
    }

    @Transactional
    public AgendamentoResponseDto concluir(Integer id) {
        validarIdAgendamento(id);
        Agendamento agendamento = buscarAgendamentoComRelacionamentosPorId(id);
        exigeStatusAgendado(agendamento);
        notificacaoClient.descartarConfirmacaoElembreteParaAgendamento(id);
        atualizarStatus(agendamento, StatusAgendamentoEnum.CONCLUIDO);
        return agendamentoMapper.toDto(agendamentoRepository.save(agendamento));
    }

    @Transactional
    public AgendamentoResponseDto remarcar(Integer id, AgendamentoRemarcarRequestDto dto) {
        validarIdAgendamento(id);
        if (dto == null) {
            throw new BadRequestException("Corpo da requisicao nao pode ser nulo");
        }

        Agendamento agendamento = buscarAgendamentoComRelacionamentosPorId(id);
        exigeStatusAgendado(agendamento);

        notificacaoClient.descartarConfirmacaoElembreteParaAgendamento(id);

        LocalDate data = dto.data();
        LocalTime horaInicio = dto.horaInicio();
        LocalTime horaFim = dto.horaFim();

        validarIntervaloHorario(horaInicio, horaFim);
        validarInicioFuturo(data, horaInicio);

        Usuario usuarioAlvo = resolverUsuarioRemarcacao(agendamento, dto.usuarioId());
        Servico servicoAlvo = resolverServicoRemarcacao(agendamento, dto.servicoId());

        validarSemConflitoHorario(usuarioAlvo.getId(), data, horaInicio, horaFim, id);

        aplicarRemarcacao(agendamento, data, horaInicio, horaFim, usuarioAlvo, servicoAlvo);

        Agendamento salvoRemarcacao = agendamentoRepository.save(agendamento);
        publicarEventoConfirmacao(salvoRemarcacao.getId());
        return agendamentoMapper.toDto(salvoRemarcacao);
    }

    @Transactional
    public void aplicarRespostaWhatsappInbound(Integer agendamentoId, RespostaWhatsappTipoEnum tipo) {
        validarIdAgendamento(agendamentoId);
        if (tipo == null) {
            throw new BadRequestException("tipo e obrigatorio");
        }

        Agendamento agendamento = buscarAgendamentoPorId(agendamentoId);
        String novoStatus = resolverStatusWhatsapp(tipo);

        if (tipo == RespostaWhatsappTipoEnum.SIM) {
            if (agendamento.getStatus() != StatusAgendamentoEnum.AGENDADO) {
                if (agendamento.getStatus() == StatusAgendamentoEnum.CONFIRMADO) {
                    log.debug("Agendamento {} ja CONFIRMADO; SIM ignorado (duplicidade).", agendamentoId);
                } else {
                    log.debug(
                            "SIM sem efeito em agendamento {} (status {}).",
                            agendamentoId,
                            agendamento.getStatus());
                }
                return;
            }
            int atualizadas = agendamentoRepository.atualizarStatusDireto(agendamentoId, novoStatus);
            if (atualizadas > 0) {
                notificacaoClient.descartarSomenteConfirmacaoParaAgendamento(agendamentoId);
                log.info("Agendamento {} -> CONFIRMADO (resposta WhatsApp SIM).", agendamentoId);
            }
            return;
        }

        if (agendamento.getStatus() != StatusAgendamentoEnum.AGENDADO
                && agendamento.getStatus() != StatusAgendamentoEnum.CONFIRMADO) {
            log.debug(
                    "NAO sem efeito em agendamento {} (status {}).",
                    agendamentoId,
                    agendamento.getStatus());
            return;
        }

        int atualizadas = agendamentoRepository.atualizarStatusDireto(agendamentoId, novoStatus);
        if (atualizadas > 0) {
            notificacaoClient.descartarConfirmacaoElembreteParaAgendamento(agendamentoId);
            log.info("Agendamento {} -> CANCELADO (resposta WhatsApp NAO).", agendamentoId);
        }
    }

    @Transactional
    public void bloquearPeriodo(AgendamentoBloquearPeriodoRequestDto dto) {
        if (dto == null) {
            throw new BadRequestException("Corpo da requisição não pode ser nulo");
        }
        Usuario usuario = usuarioRepository.findById(dto.usuarioId())
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        LocalDate data = dto.data();
        LocalTime horaInicio = dto.horaInicio();
        LocalTime horaFim = dto.horaFim();

        validarIntervaloHorario(horaInicio, horaFim);
        validarSemConflitoHorario(usuario.getId(), data, horaInicio, horaFim, null, "Já existe agendamento não cancelado neste intervalo para o profissional");

        Agendamento bloqueio = novoBloqueioPeriodo(data, horaInicio, horaFim, usuario);
        agendamentoRepository.save(bloqueio);
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
                .map(this::toLembreteResponse)
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

        long quantidadeConflitos = contarConflitosHorario(usuarioId, data, horaInicio, horaFim, excludeAgendamentoId);
        return new VerificacaoConflitoAgendamentoResponseDto(quantidadeConflitos);
    }

    @Transactional(readOnly = true)
    public List<HorarioSlotResponseDto> listarSlotsDisponiveis(Integer usuarioId, LocalDate data, Integer duracaoMinutos) {
        if (usuarioId == null) {
            throw new BadRequestException("usuarioId e obrigatorio");
        }
        if (data == null) {
            throw new BadRequestException("data e obrigatoria");
        }
        int duracaoSlot = resolverDuracaoMinutos(duracaoMinutos);

        Usuario usuario = buscarUsuarioPorId(usuarioId);
        LocalTime inicioFuncionamento = usuario.getEstabelecimento().getInicioFuncionamento();
        LocalTime fimFuncionamento = usuario.getEstabelecimento().getFimFuncionamento();

        validarHorarioFuncionamento(inicioFuncionamento, fimFuncionamento);

        return calcularSlotsDisponiveis(usuarioId, data, duracaoSlot, inicioFuncionamento, fimFuncionamento);
    }

    @Transactional(readOnly = true)
    public List<AgendamentoUsuarioPeriodoResponseDto> listarPorUsuarioEPeriodo(
            Integer usuarioId,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        if (usuarioId == null) {
            throw new BadRequestException("usuarioId e obrigatorio");
        }
        validarPeriodo(dataInicio, dataFim);

        return agendamentoRepository
                .findByUsuarioIdAndDataBetweenOrderByDataAscHoraInicioAsc(usuarioId, dataInicio, dataFim)
                .stream()
                .map(this::toAgendamentoUsuarioPeriodoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DiaValidoPeriodoResponseDto> listarDiasValidos(
            Integer usuarioId,
            LocalDate dataInicio,
            LocalDate dataFim
    ) {
        if (usuarioId == null) {
            throw new BadRequestException("usuarioId e obrigatorio");
        }
        validarPeriodo(dataInicio, dataFim);

        Set<LocalDate> feriados = buscarFeriadosNoPeriodo(dataInicio, dataFim);

        List<DiaValidoPeriodoResponseDto> dias = new ArrayList<>();
        for (LocalDate data = dataInicio; !data.isAfter(dataFim); data = data.plusDays(1)) {
            boolean disponivel = diaEstaDisponivelParaAgendamento(usuarioId, data, feriados);
            dias.add(new DiaValidoPeriodoResponseDto(data, disponivel));
        }

        return dias;
    }

    @Transactional(readOnly = true)
    public TaxaOcupacaoResponseDto calcularTaxaOcupacao(
            Integer usuarioId,
            LocalDate dataInicio,
            LocalDate dataFim,
            Integer duracaoMinutos
    ) {
        if (usuarioId == null) {
            throw new BadRequestException("usuarioId e obrigatorio");
        }
        validarPeriodo(dataInicio, dataFim);

        int duracaoSlot = resolverDuracaoMinutos(duracaoMinutos);

        Usuario usuario = buscarUsuarioPorId(usuarioId);

        LocalTime expedienteInicio = usuario.getEstabelecimento().getInicioFuncionamento();
        LocalTime expedienteFim = usuario.getEstabelecimento().getFimFuncionamento();

        validarHorarioFuncionamento(expedienteInicio, expedienteFim);

        long slotsPorDia = Duration.between(expedienteInicio, expedienteFim).toMinutes() / duracaoSlot;

        long totalDias = dataInicio.datesUntil(dataFim.plusDays(1)).count();
        long capacidadeMaxima = totalDias * slotsPorDia;

        // Conta agendamentos efetivos (exclui CANCELADO e BLOQUEADO)
        EnumSet<StatusAgendamentoEnum> statusExcluidos =
                EnumSet.of(StatusAgendamentoEnum.CANCELADO, StatusAgendamentoEnum.BLOQUEADO);

        long totalAgendamentos = agendamentoRepository.countByUsuarioIdAndDataBetweenAndStatusNotIn(
                usuarioId, dataInicio, dataFim, statusExcluidos
        );

        double taxaOcupacao = capacidadeMaxima > 0
                ? Math.round((double) totalAgendamentos / capacidadeMaxima * 10000.0) / 100.0
                : 0.0;

        return new TaxaOcupacaoResponseDto(
                dataInicio,
                dataFim,
                duracaoSlot,
                totalAgendamentos,
                capacidadeMaxima,
                taxaOcupacao
        );
    }

    private Cliente buscarClientePorId(Integer clienteId) {
        return clienteRepository
                .findById(clienteId)
                .orElseThrow(() -> new NotFoundException(MSG_CLIENTE_NAO_ENCONTRADO));
    }

    private Servico buscarServicoPorId(Integer servicoId) {
        return servicoRepository
                .findById(servicoId)
                .orElseThrow(() -> new NotFoundException(MSG_SERVICO_NAO_ENCONTRADO));
    }

    private Usuario buscarUsuarioPorId(Integer usuarioId) {
        return usuarioRepository
                .findById(usuarioId)
                .orElseThrow(() -> new NotFoundException(MSG_USUARIO_NAO_ENCONTRADO));
    }

    private Agendamento buscarAgendamentoComRelacionamentosPorId(Integer agendamentoId) {
        return agendamentoRepository
                .findByIdWithRelations(agendamentoId)
                .orElseThrow(() -> new NotFoundException(MSG_AGENDAMENTO_NAO_ENCONTRADO));
    }

    private Agendamento buscarAgendamentoPorId(Integer agendamentoId) {
        return agendamentoRepository
                .findById(agendamentoId)
                .orElseThrow(() -> new NotFoundException(MSG_AGENDAMENTO_NAO_ENCONTRADO));
    }

    private Agendamento novoAgendamento(
            AgendamentoCreateRequestDto dto,
            Cliente cliente,
            Servico servico,
            Usuario usuario
    ) {
        LocalDateTime agora = agoraLocal();

        Agendamento agendamento = new Agendamento();
        agendamento.setData(dto.data());
        agendamento.setHoraInicio(dto.horaInicio());
        agendamento.setHoraFim(dto.horaFim());
        agendamento.setStatus(StatusAgendamentoEnum.AGENDADO);
        agendamento.setObservacoes(trimToNull(dto.observacoes()));
        agendamento.setCriadoEm(agora);
        agendamento.setAtualizadoEm(agora);
        agendamento.setCliente(cliente);
        agendamento.setServico(servico);
        agendamento.setUsuario(usuario);
        return agendamento;
    }

    private Agendamento novoBloqueioPeriodo(LocalDate data, LocalTime horaInicio, LocalTime horaFim, Usuario usuario) {
        LocalDateTime agora = agoraLocal();

        Agendamento bloqueio = new Agendamento();
        bloqueio.setData(data);
        bloqueio.setHoraInicio(horaInicio);
        bloqueio.setHoraFim(horaFim);
        bloqueio.setStatus(StatusAgendamentoEnum.BLOQUEADO);
        bloqueio.setObservacoes(OBSERVACAO_BLOQUEIO_PERIODO);
        bloqueio.setCriadoEm(agora);
        bloqueio.setAtualizadoEm(agora);
        bloqueio.setCliente(null);
        bloqueio.setServico(null);
        bloqueio.setUsuario(usuario);
        return bloqueio;
    }

    private void aplicarRemarcacao(
            Agendamento agendamento,
            LocalDate data,
            LocalTime horaInicio,
            LocalTime horaFim,
            Usuario usuario,
            Servico servico
    ) {
        agendamento.setData(data);
        agendamento.setHoraInicio(horaInicio);
        agendamento.setHoraFim(horaFim);
        agendamento.setUsuario(usuario);
        agendamento.setServico(servico);
        agendamento.setAtualizadoEm(agoraLocal());
    }

    private Usuario resolverUsuarioRemarcacao(Agendamento agendamento, Integer novoUsuarioId) {
        if (novoUsuarioId == null) {
            return agendamento.getUsuario();
        }

        Usuario candidato = buscarUsuarioPorId(novoUsuarioId);
        if (!mesmoEstabelecimento(agendamento.getUsuario(), candidato)) {
            throw new UnprocessableEntityException(
                    "O novo usuario deve pertencer ao mesmo estabelecimento do agendamento atual"
            );
        }

        return candidato;
    }

    private Servico resolverServicoRemarcacao(Agendamento agendamento, Integer novoServicoId) {
        if (novoServicoId == null) {
            return agendamento.getServico();
        }

        return buscarServicoPorId(novoServicoId);
    }

    private String resolverStatusWhatsapp(RespostaWhatsappTipoEnum tipo) {
        if (tipo == RespostaWhatsappTipoEnum.SIM) {
            return StatusAgendamentoEnum.CONFIRMADO.name();
        }
        if (tipo == RespostaWhatsappTipoEnum.NAO) {
            return StatusAgendamentoEnum.CANCELADO.name();
        }
        throw new BadRequestException("tipo de resposta WhatsApp invalido para atualizacao de status");
    }

    private AgendamentoLembreteResponseDto toLembreteResponse(Agendamento agendamento) {
        return new AgendamentoLembreteResponseDto(
                agendamento.getId(),
                agendamento.getCliente().getTelefone(),
                agendamento.getHoraInicio()
        );
    }

    private AgendamentoUsuarioPeriodoResponseDto toAgendamentoUsuarioPeriodoResponse(Agendamento agendamento) {
        return new AgendamentoUsuarioPeriodoResponseDto(
                agendamento.getId(),
                agendamento.getData(),
                agendamento.getHoraInicio(),
                agendamento.getHoraFim(),
                agendamento.getCliente() != null ? agendamento.getCliente().getNome() : null,
                agendamento.getStatus(),
                agendamento.getServico() != null ? agendamento.getServico().getPreco() : null
        );
    }

    private Set<LocalDate> buscarFeriadosNoPeriodo(LocalDate dataInicio, LocalDate dataFim) {
        Set<LocalDate> feriados = new HashSet<>();
        for (int ano = dataInicio.getYear(); ano <= dataFim.getYear(); ano++) {
            feriados.addAll(feriadosPort.buscarFeriados(ano));
        }
        return feriados;
    }

    private boolean diaEstaDisponivelParaAgendamento(Integer usuarioId, LocalDate data, Set<LocalDate> feriados) {
        if (ehFimDeSemana(data) || feriados.contains(data)) {
            return false;
        }

        // Dia fica indisponivel quando o endpoint de slots retornaria lista vazia.
        return !listarSlotsDisponiveis(usuarioId, data, DURACAO_PADRAO_MIN).isEmpty();
    }

    private boolean ehFimDeSemana(LocalDate data) {
        return data.getDayOfWeek() == DayOfWeek.SATURDAY || data.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

    private List<HorarioSlotResponseDto> calcularSlotsDisponiveis(
            Integer usuarioId,
            LocalDate data,
            int duracaoSlot,
            LocalTime inicioFuncionamento,
            LocalTime fimFuncionamento
    ) {
        List<HorarioSlotResponseDto> slotsDisponiveis = new ArrayList<>();
        for (LocalTime horaCandidata = inicioFuncionamento;
             !horaCandidata.plusMinutes(duracaoSlot).isAfter(fimFuncionamento);
             horaCandidata = horaCandidata.plusMinutes(SLOT_STEP_MINUTES)) {
            LocalTime horaInicio = horaCandidata;
            LocalTime horaFim = horaCandidata.plusMinutes(duracaoSlot);

            if (!inicioSlotNoFuturo(data, horaInicio)) {
                continue;
            }

            if (slotEstaDisponivel(usuarioId, data, horaInicio, horaFim)) {
                slotsDisponiveis.add(new HorarioSlotResponseDto(horaInicio, horaFim));
            }
        }
        return slotsDisponiveis;
    }

    private boolean slotEstaDisponivel(Integer usuarioId, LocalDate data, LocalTime horaInicio, LocalTime horaFim) {
        return contarConflitosHorario(usuarioId, data, horaInicio, horaFim, null) == 0;
    }

    private void publicarEventoConfirmacao(Integer agendamentoId) {
        eventPublisher.publishEvent(new AgendamentoNotificacaoConfirmacaoEvent(agendamentoId));
    }

    private void atualizarStatus(Agendamento agendamento, StatusAgendamentoEnum novoStatus) {
        agendamento.setStatus(novoStatus);
        agendamento.setAtualizadoEm(agoraLocal());
    }

    private LocalDateTime agoraLocal() {
        return LocalDateTime.now(ZONA_APP);
    }

    private void validarSemConflitoHorario(
            Integer usuarioId,
            LocalDate data,
            LocalTime horaInicio,
            LocalTime horaFim,
            Integer agendamentoIgnoradoId
    ) {
        validarSemConflitoHorario(usuarioId, data, horaInicio, horaFim, agendamentoIgnoradoId, MSG_CONFLITO_INTERVALO);
    }

    private void validarSemConflitoHorario(
            Integer usuarioId,
            LocalDate data,
            LocalTime horaInicio,
            LocalTime horaFim,
            Integer agendamentoIgnoradoId,
            String mensagemConflito
    ) {
        if (contarConflitosHorario(usuarioId, data, horaInicio, horaFim, agendamentoIgnoradoId) > 0) {
            throw new ConflictException(mensagemConflito);
        }
    }

    private long contarConflitosHorario(
            Integer usuarioId,
            LocalDate data,
            LocalTime horaInicio,
            LocalTime horaFim,
            Integer agendamentoIgnoradoId
    ) {
        return agendamentoRepository.countAgendamentosConflitantes(
                usuarioId,
                data,
                horaInicio,
                horaFim,
                agendamentoIgnoradoId,
                StatusAgendamentoEnum.CANCELADO
        );
    }

    private int resolverDuracaoMinutos(Integer duracaoMinutos) {
        int duracao = duracaoMinutos != null ? duracaoMinutos : DURACAO_PADRAO_MIN;
        if (duracao < DURACAO_SLOT_MIN || duracao > DURACAO_SLOT_MAX) {
            throw new UnprocessableEntityException(
                    "duracaoMinutos deve estar entre " + DURACAO_SLOT_MIN + " e " + DURACAO_SLOT_MAX
            );
        }
        return duracao;
    }

    private void validarHorarioFuncionamento(LocalTime inicioFuncionamento, LocalTime fimFuncionamento) {
        if (!inicioFuncionamento.isBefore(fimFuncionamento)) {
            throw new UnprocessableEntityException(MSG_HORARIO_FUNCIONAMENTO_INVALIDO);
        }
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
