package com.fisasaude.projeto.sitema_agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoCreateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.AgendamentoRemarcarRequestDto;
import com.fisasaude.projeto.sitema_agendamento.dto.agendamento.HorarioSlotResponseDto;
import com.fisasaude.projeto.sitema_agendamento.event.AgendamentoNotificacaoConfirmacaoEvent;
import com.fisasaude.projeto.sitema_agendamento.exception.BadRequestException;
import com.fisasaude.projeto.sitema_agendamento.exception.ConflictException;
import com.fisasaude.projeto.sitema_agendamento.exception.NotFoundException;
import com.fisasaude.projeto.sitema_agendamento.exception.UnprocessableEntityException;
import com.fisasaude.projeto.sitema_agendamento.mapper.AgendamentoMapper;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Agendamento;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Cliente;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Estabelecimento;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Servico;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Usuario;
import com.fisasaude.projeto.sitema_agendamento.model.enums.RoleEnum;
import com.fisasaude.projeto.sitema_agendamento.model.enums.SexoEnum;
import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusAgendamentoEnum;
import com.fisasaude.projeto.sitema_agendamento.repository.AgendamentoRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.ClienteRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.ServicoRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class AgendamentoServiceTest {

    private static final ZoneId Z = ZoneId.of("America/Sao_Paulo");

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ServicoRepository servicoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Spy
    private AgendamentoMapper agendamentoMapper = new AgendamentoMapper();

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private NotificacaoDispatchService notificacaoDispatchService;

    @InjectMocks
    private AgendamentoService service;

    private LocalDate dataFutura;
    private LocalTime hi;
    private LocalTime hf;
    private Cliente cliente;
    private Servico servico;
    private Usuario usuario;
    private Estabelecimento estab1;

    @BeforeEach
    void init() {
        dataFutura = LocalDate.now(Z).plusDays(3);
        hi = LocalTime.of(10, 0);
        hf = LocalTime.of(11, 0);

        estab1 = new Estabelecimento();
        estab1.setId(1);
        estab1.setNome("Clinica");
        estab1.setEndereco("Rua");
        estab1.setInicioFuncionamento(LocalTime.of(6, 0));
        estab1.setFimFuncionamento(LocalTime.of(22, 0));

        cliente = new Cliente();
        cliente.setId(10);
        cliente.setNome("Ana");
        cliente.setTelefone("5511999999999");
        cliente.setDataNascimento(LocalDate.of(1990, 1, 1));
        cliente.setSexo(SexoEnum.F);

        servico = new Servico();
        servico.setId(20);
        servico.setNome("Pilates");
        servico.setTipo("grupo");
        servico.setPreco(BigDecimal.valueOf(80));

        usuario = criarUsuario(30, estab1);
    }

    @Test
    void criar_corpoNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.criar(null)).isInstanceOf(BadRequestException.class);
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void criar_clienteNaoEncontrado_lancaNotFound() {
        when(clienteRepository.findById(10)).thenReturn(Optional.empty());

        AgendamentoCreateRequestDto dto = new AgendamentoCreateRequestDto(
                10,
                servico.getId(),
                usuario.getId(),
                dataFutura,
                hi,
                hf,
                null
        );

        assertThatThrownBy(() -> service.criar(dto)).isInstanceOf(NotFoundException.class);
        verify(agendamentoRepository, never()).save(any());
    }

    @Test
    void criar_conflitoDeHorario_lancaConflict() {
        stubFksParaCriar();
        when(agendamentoRepository.countAgendamentosConflitantes(
                        eq(usuario.getId()),
                        eq(dataFutura),
                        eq(hi),
                        eq(hf),
                        eq(null),
                        eq(StatusAgendamentoEnum.CANCELADO)))
                .thenReturn(1L);

        AgendamentoCreateRequestDto dto = new AgendamentoCreateRequestDto(
                cliente.getId(),
                servico.getId(),
                usuario.getId(),
                dataFutura,
                hi,
                hf,
                null
        );

        assertThatThrownBy(() -> service.criar(dto)).isInstanceOf(ConflictException.class);
        verify(agendamentoRepository, never()).save(any());
    }

    @Test
    void criar_intervaloIgualHoras_lancaUnprocessable() {
        stubFksParaCriar();

        AgendamentoCreateRequestDto dto = new AgendamentoCreateRequestDto(
                cliente.getId(),
                servico.getId(),
                usuario.getId(),
                dataFutura,
                LocalTime.of(10, 0),
                LocalTime.of(10, 0),
                null
        );

        assertThatThrownBy(() -> service.criar(dto)).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    void criar_inicioNaoPosteriorAoAgor_lancaUnprocessable() {
        stubFksParaCriar();

        LocalDate ontem = LocalDate.now(Z).minusDays(1);
        AgendamentoCreateRequestDto dto = new AgendamentoCreateRequestDto(
                cliente.getId(),
                servico.getId(),
                usuario.getId(),
                ontem,
                LocalTime.of(15, 0),
                LocalTime.of(16, 0),
                null
        );

        assertThatThrownBy(() -> service.criar(dto)).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    void criar_sucesso_publicaEventoEUsoSalvar() {
        stubFksParaCriar();
        when(agendamentoRepository.countAgendamentosConflitantes(
                        eq(usuario.getId()),
                        eq(dataFutura),
                        eq(hi),
                        eq(hf),
                        eq(null),
                        eq(StatusAgendamentoEnum.CANCELADO)))
                .thenReturn(0L);

        when(agendamentoRepository.save(any(Agendamento.class)))
                .thenAnswer(inv -> {
                    Agendamento a = inv.getArgument(0);
                    a.setId(999);
                    return a;
                });

        AgendamentoCreateRequestDto dto = new AgendamentoCreateRequestDto(
                cliente.getId(),
                servico.getId(),
                usuario.getId(),
                dataFutura,
                hi,
                hf,
                "obs"
        );

        assertThat(service.criar(dto).id()).isEqualTo(999);

        ArgumentCaptor<Object> evt = ArgumentCaptor.forClass(Object.class);
        verify(eventPublisher).publishEvent(evt.capture());
        assertThat(evt.getValue()).isInstanceOf(AgendamentoNotificacaoConfirmacaoEvent.class);
        assertThat(((AgendamentoNotificacaoConfirmacaoEvent) evt.getValue()).agendamentoId()).isEqualTo(999);
    }

    @Test
    void cancelar_somenteAgendado_chamaDescarteENotificacao() {
        Agendamento a = agendamentoAgendado(1, usuario, servico, cliente);

        when(agendamentoRepository.findByIdWithRelations(1)).thenReturn(Optional.of(a));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(inv -> inv.getArgument(0));

        service.cancelar(1);

        verify(notificacaoDispatchService).descartarConfirmacaoElembreteParaAgendamento(1);
        assertThat(a.getStatus()).isEqualTo(StatusAgendamentoEnum.CANCELADO);
    }

    @Test
    void cancelar_statusNaoAgendado_lancaUnprocessable() {
        Agendamento a = agendamentoAgendado(1, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CONCLUIDO);
        when(agendamentoRepository.findByIdWithRelations(1)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> service.cancelar(1)).isInstanceOf(UnprocessableEntityException.class);
        verify(notificacaoDispatchService, never()).descartarConfirmacaoElembreteParaAgendamento(any());
    }

    @Test
    void concluir_sucesso_descartaNotificacao() {
        Agendamento a = agendamentoAgendado(2, usuario, servico, cliente);
        when(agendamentoRepository.findByIdWithRelations(2)).thenReturn(Optional.of(a));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(inv -> inv.getArgument(0));

        service.concluir(2);

        verify(notificacaoDispatchService).descartarConfirmacaoElembreteParaAgendamento(2);
        assertThat(a.getStatus()).isEqualTo(StatusAgendamentoEnum.CONCLUIDO);
    }

    @Test
    void remarcar_sucesso_publica_evento_semConflitos() {
        Agendamento a = agendamentoAgendado(5, usuario, servico, cliente);
        a.setData(dataFutura);
        a.setHoraInicio(hi);
        a.setHoraFim(hf);

        LocalDate novoDia = dataFutura.plusDays(1);
        LocalTime nHi = LocalTime.of(14, 0);
        LocalTime nHf = LocalTime.of(15, 30);

        when(agendamentoRepository.findByIdWithRelations(5)).thenReturn(Optional.of(a));
        when(agendamentoRepository.save(any(Agendamento.class)))
                .thenAnswer(inv -> {
                    Agendamento x = inv.getArgument(0);
                    x.setId(5);
                    return x;
                });
        when(agendamentoRepository.countAgendamentosConflitantes(
                        eq(usuario.getId()),
                        eq(novoDia),
                        eq(nHi),
                        eq(nHf),
                        eq(5),
                        eq(StatusAgendamentoEnum.CANCELADO)))
                .thenReturn(0L);

        AgendamentoRemarcarRequestDto dto = new AgendamentoRemarcarRequestDto(novoDia, nHi, nHf, null, null);

        assertThat(service.remarcar(5, dto).id()).isEqualTo(5);
        verify(notificacaoDispatchService).descartarConfirmacaoElembreteParaAgendamento(5);

        ArgumentCaptor<Object> evt = ArgumentCaptor.forClass(Object.class);
        verify(eventPublisher).publishEvent(evt.capture());
        assertThat(((AgendamentoNotificacaoConfirmacaoEvent) evt.getValue()).agendamentoId()).isEqualTo(5);

        assertThat(a.getData()).isEqualTo(novoDia);
        assertThat(a.getHoraInicio()).isEqualTo(nHi);
        assertThat(a.getHoraFim()).isEqualTo(nHf);
    }

    @Test
    void remarcar_estabelecimentoDiferente_lancaUnprocessable() {
        Estabelecimento estab2 = new Estabelecimento();
        estab2.setId(2);
        estab2.setNome("Outra");
        estab2.setEndereco("X");
        estab2.setInicioFuncionamento(LocalTime.of(6, 0));
        estab2.setFimFuncionamento(LocalTime.of(22, 0));

        Usuario usuarioOutraUnidade = criarUsuario(31, estab2);

        Agendamento a = agendamentoAgendado(6, usuario, servico, cliente);
        when(agendamentoRepository.findByIdWithRelations(6)).thenReturn(Optional.of(a));
        when(usuarioRepository.findById(31)).thenReturn(Optional.of(usuarioOutraUnidade));

        LocalDate novoDia = dataFutura.plusDays(2);
        AgendamentoRemarcarRequestDto dto =
                new AgendamentoRemarcarRequestDto(novoDia, LocalTime.of(16, 0), LocalTime.of(17, 0), 31, null);

        assertThatThrownBy(() -> service.remarcar(6, dto)).isInstanceOf(UnprocessableEntityException.class);
        verify(notificacaoDispatchService).descartarConfirmacaoElembreteParaAgendamento(6);
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void listarSlotsDisponiveis_retornaLivresQuandoRepoRetornaZeroConflitos() {
        LocalDate slotDay = LocalDate.now(Z).plusDays(2);
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));

        when(agendamentoRepository.countAgendamentosConflitantes(
                        eq(usuario.getId()),
                        eq(slotDay),
                        any(LocalTime.class),
                        any(LocalTime.class),
                        eq(null),
                        eq(StatusAgendamentoEnum.CANCELADO)))
                .thenReturn(0L);

        java.util.List<HorarioSlotResponseDto> livres =
                service.listarSlotsDisponiveis(usuario.getId(), slotDay, 60);

        assertThat(livres).isNotEmpty();
        assertThat(livres.getFirst().horaInicio()).isBefore(livres.getFirst().horaFim());
    }

    @Test
    void obterResumo_periodoInvertido_lancaUnprocessable() {
        LocalDate ini = LocalDate.now(Z);
        LocalDate fim = ini.minusDays(1);

        assertThatThrownBy(() -> service.obterResumoPorStatusNoPeriodo(ini, fim))
                .isInstanceOf(UnprocessableEntityException.class);
    }

    private void stubFksParaCriar() {
        when(clienteRepository.findById(cliente.getId())).thenReturn(Optional.of(cliente));
        when(servicoRepository.findById(servico.getId())).thenReturn(Optional.of(servico));
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
    }

    private static Usuario criarUsuario(int id, Estabelecimento est) {
        Usuario u = new Usuario();
        u.setId(id);
        u.setNome("Prof " + id);
        u.setEmail("p" + id + "@test.com");
        u.setSenha("x");
        u.setRole(RoleEnum.USUARIO);
        u.setEstabelecimento(est);
        return u;
    }

    private static Agendamento agendamentoAgendado(
            int id, Usuario usuario, Servico servico, Cliente cliente
    ) {
        Agendamento a = new Agendamento();
        a.setId(id);
        a.setStatus(StatusAgendamentoEnum.AGENDADO);
        a.setUsuario(usuario);
        a.setServico(servico);
        a.setCliente(cliente);
        a.setData(LocalDate.now(Z).plusDays(1));
        a.setHoraInicio(LocalTime.of(9, 0));
        a.setHoraFim(LocalTime.of(10, 0));
        a.setCriadoEm(java.time.LocalDateTime.now(Z));
        a.setAtualizadoEm(java.time.LocalDateTime.now(Z));
        return a;
    }
}
