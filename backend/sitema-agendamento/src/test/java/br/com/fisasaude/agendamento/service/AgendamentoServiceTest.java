package br.com.fisasaude.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoBloquearPeriodoRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoRemarcarRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoUsuarioPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.DiaValidoPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.HorarioSlotResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.TaxaOcupacaoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.VerificacaoConflitoAgendamentoResponseDto;
import br.com.fisasaude.agendamento.event.AgendamentoNotificacaoConfirmacaoEvent;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.ConflictException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.exception.UnprocessableEntityException;
import br.com.fisasaude.agendamento.service.port.FeriadosPort;
import br.com.fisasaude.agendamento.mapper.AgendamentoMapper;
import br.com.fisasaude.agendamento.model.entity.Agendamento;
import br.com.fisasaude.agendamento.model.entity.Cliente;
import br.com.fisasaude.agendamento.model.entity.Estabelecimento;
import br.com.fisasaude.agendamento.model.entity.Servico;
import br.com.fisasaude.agendamento.model.entity.Usuario;
import br.com.fisasaude.agendamento.model.enums.RespostaWhatsappTipoEnum;
import br.com.fisasaude.agendamento.model.enums.RoleEnum;
import br.com.fisasaude.agendamento.model.enums.SexoEnum;
import br.com.fisasaude.agendamento.model.enums.StatusAgendamentoEnum;
import br.com.fisasaude.agendamento.repository.AgendamentoRepository;
import br.com.fisasaude.agendamento.repository.ClienteRepository;
import br.com.fisasaude.agendamento.repository.ServicoRepository;
import br.com.fisasaude.agendamento.repository.UsuarioRepository;
import br.com.fisasaude.agendamento.integration.notificacao.NotificacaoClient;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.Set;
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
    private NotificacaoClient notificacaoClient;

    @Mock
    private FeriadosPort feriadosPort;

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
    void aplicarRespostaWhatsapp_sim_comAgendado_confirma_eDescartaSomenteConfirmacao() {
        Agendamento a = agendamentoAgendado(50, usuario, servico, cliente);
        when(agendamentoRepository.findById(50)).thenReturn(Optional.of(a));
        when(agendamentoRepository.atualizarStatusDireto(eq(50), eq("CONFIRMADO"))).thenReturn(1);

        service.aplicarRespostaWhatsappInbound(50, RespostaWhatsappTipoEnum.SIM);

        verify(agendamentoRepository).atualizarStatusDireto(50, "CONFIRMADO");
        verify(notificacaoClient).descartarSomenteConfirmacaoParaAgendamento(50);
        verify(notificacaoClient, never()).descartarConfirmacaoElembreteParaAgendamento(any());
    }

    @Test
    void aplicarRespostaWhatsapp_nao_comAgendado_cancela_eDescartaTudo() {
        Agendamento a = agendamentoAgendado(51, usuario, servico, cliente);
        when(agendamentoRepository.findById(51)).thenReturn(Optional.of(a));
        when(agendamentoRepository.atualizarStatusDireto(eq(51), eq("CANCELADO"))).thenReturn(1);

        service.aplicarRespostaWhatsappInbound(51, RespostaWhatsappTipoEnum.NAO);

        verify(agendamentoRepository).atualizarStatusDireto(51, "CANCELADO");
        verify(notificacaoClient).descartarConfirmacaoElembreteParaAgendamento(51);
        verify(notificacaoClient, never()).descartarSomenteConfirmacaoParaAgendamento(any());
    }

    @Test
    void cancelar_somenteAgendado_chamaDescarteENotificacao() {
        Agendamento a = agendamentoAgendado(1, usuario, servico, cliente);

        when(agendamentoRepository.findByIdWithRelations(1)).thenReturn(Optional.of(a));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(inv -> inv.getArgument(0));

        service.cancelar(1);

        verify(notificacaoClient).descartarConfirmacaoElembreteParaAgendamento(1);
        assertThat(a.getStatus()).isEqualTo(StatusAgendamentoEnum.CANCELADO);
    }

    @Test
    void cancelar_statusNaoAgendado_lancaUnprocessable() {
        Agendamento a = agendamentoAgendado(1, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CONCLUIDO);
        when(agendamentoRepository.findByIdWithRelations(1)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> service.cancelar(1)).isInstanceOf(UnprocessableEntityException.class);
        verify(notificacaoClient, never()).descartarConfirmacaoElembreteParaAgendamento(any());
    }

    @Test
    void cancelar_confirmado_descarta_notificacao() {
        Agendamento a = agendamentoAgendado(7, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CONFIRMADO);

        when(agendamentoRepository.findByIdWithRelations(7)).thenReturn(Optional.of(a));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(inv -> inv.getArgument(0));

        service.cancelar(7);

        verify(notificacaoClient).descartarConfirmacaoElembreteParaAgendamento(7);
        assertThat(a.getStatus()).isEqualTo(StatusAgendamentoEnum.CANCELADO);
    }

    @Test
    void concluir_confirmado_permiteIgualAgendado() {
        Agendamento a = agendamentoAgendado(8, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CONFIRMADO);
        when(agendamentoRepository.findByIdWithRelations(8)).thenReturn(Optional.of(a));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(inv -> inv.getArgument(0));

        service.concluir(8);

        verify(notificacaoClient).descartarConfirmacaoElembreteParaAgendamento(8);
        assertThat(a.getStatus()).isEqualTo(StatusAgendamentoEnum.CONCLUIDO);
    }

    @Test
    void concluir_sucesso_descartaNotificacao() {
        Agendamento a = agendamentoAgendado(2, usuario, servico, cliente);
        when(agendamentoRepository.findByIdWithRelations(2)).thenReturn(Optional.of(a));
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(inv -> inv.getArgument(0));

        service.concluir(2);

        verify(notificacaoClient).descartarConfirmacaoElembreteParaAgendamento(2);
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
        verify(notificacaoClient).descartarConfirmacaoElembreteParaAgendamento(5);

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
        verify(notificacaoClient).descartarConfirmacaoElembreteParaAgendamento(6);
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
    void listarPorUsuarioEPeriodo_sucesso_retornaCamposEsperados() {
        LocalDate inicio = LocalDate.now(Z);
        LocalDate fim = inicio.plusDays(7);

        Agendamento a = agendamentoAgendado(99, usuario, servico, cliente);
        a.setHoraInicio(LocalTime.of(14, 30));
        a.setHoraFim(LocalTime.of(15, 30));
        a.setStatus(StatusAgendamentoEnum.CONFIRMADO);

        when(agendamentoRepository.findByUsuarioIdAndDataBetweenOrderByDataAscHoraInicioAsc(
                usuario.getId(),
                inicio,
                fim
        )).thenReturn(List.of(a));

        List<AgendamentoUsuarioPeriodoResponseDto> resultado =
                service.listarPorUsuarioEPeriodo(usuario.getId(), inicio, fim);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.getFirst().id()).isEqualTo(99);
        assertThat(resultado.getFirst().horaInicio()).isEqualTo(LocalTime.of(14, 30));
        assertThat(resultado.getFirst().horaFim()).isEqualTo(LocalTime.of(15, 30));
        assertThat(resultado.getFirst().nomeCliente()).isEqualTo("Ana");
        assertThat(resultado.getFirst().status()).isEqualTo(StatusAgendamentoEnum.CONFIRMADO);
        assertThat(resultado.getFirst().preco()).isEqualByComparingTo(BigDecimal.valueOf(80));
    }

    @Test
    void listarPorUsuarioEPeriodo_bloqueio_semClienteEServico_retornaComNulos() {
        LocalDate inicio = LocalDate.now(Z);
        LocalDate fim = inicio.plusDays(7);

        Agendamento bloqueio = new Agendamento();
        bloqueio.setId(200);
        bloqueio.setStatus(StatusAgendamentoEnum.BLOQUEADO);
        bloqueio.setUsuario(usuario);
        bloqueio.setCliente(null);
        bloqueio.setServico(null);
        bloqueio.setData(inicio.plusDays(1));
        bloqueio.setHoraInicio(LocalTime.of(10, 0));
        bloqueio.setHoraFim(LocalTime.of(11, 0));
        bloqueio.setCriadoEm(java.time.LocalDateTime.now(Z));
        bloqueio.setAtualizadoEm(java.time.LocalDateTime.now(Z));

        when(agendamentoRepository.findByUsuarioIdAndDataBetweenOrderByDataAscHoraInicioAsc(
                usuario.getId(),
                inicio,
                fim
        )).thenReturn(List.of(bloqueio));

        List<AgendamentoUsuarioPeriodoResponseDto> resultado =
                service.listarPorUsuarioEPeriodo(usuario.getId(), inicio, fim);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.getFirst().id()).isEqualTo(200);
        assertThat(resultado.getFirst().status()).isEqualTo(StatusAgendamentoEnum.BLOQUEADO);
        assertThat(resultado.getFirst().horaInicio()).isEqualTo(LocalTime.of(10, 0));
        assertThat(resultado.getFirst().horaFim()).isEqualTo(LocalTime.of(11, 0));
        assertThat(resultado.getFirst().nomeCliente()).isNull();
        assertThat(resultado.getFirst().preco()).isNull();
    }

    @Test
    void listarPorUsuarioEPeriodo_usuarioIdNulo_lancaBadRequest() {
        LocalDate inicio = LocalDate.now(Z);
        LocalDate fim = inicio.plusDays(1);

        assertThatThrownBy(() -> service.listarPorUsuarioEPeriodo(null, inicio, fim))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarDiasValidos_diaUtilComSlots_disponivelTrue() {
        LocalDate dia = proximoDiaUtil(LocalDate.now(Z).plusDays(2));
        when(feriadosPort.buscarFeriados(dia.getYear())).thenReturn(Set.of());
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(agendamentoRepository.countAgendamentosConflitantes(
                eq(usuario.getId()),
                eq(dia),
                any(LocalTime.class),
                any(LocalTime.class),
                eq(null),
                eq(StatusAgendamentoEnum.CANCELADO)
        )).thenReturn(0L);

        List<DiaValidoPeriodoResponseDto> resultado = service.listarDiasValidos(usuario.getId(), dia, dia);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.getFirst().data()).isEqualTo(dia);
        assertThat(resultado.getFirst().disponivel()).isTrue();
    }

    @Test
    void listarDiasValidos_diaFeriado_disponivelFalse() {
        LocalDate feriado = LocalDate.of(2026, 1, 1);
        when(feriadosPort.buscarFeriados(feriado.getYear()))
                .thenReturn(Set.of(feriado));

        List<DiaValidoPeriodoResponseDto> resultado = service.listarDiasValidos(usuario.getId(), feriado, feriado);

        assertThat(resultado).hasSize(1);
        assertThat(resultado.getFirst().disponivel()).isFalse();
        verify(usuarioRepository, never()).findById(any());
    }

    @Test
    void listarDiasValidos_usuarioIdNulo_lancaBadRequest() {
        LocalDate dia = LocalDate.of(2026, 5, 5);

        assertThatThrownBy(() -> service.listarDiasValidos(null, dia, dia))
                .isInstanceOf(BadRequestException.class);
    }

    // ─────────────────────────────────────────────────────────────
    // criar – caminhos adicionais
    // ─────────────────────────────────────────────────────────────

    @Test
    void criar_servicoNaoEncontrado_lancaNotFound() {
        when(clienteRepository.findById(cliente.getId())).thenReturn(Optional.of(cliente));
        when(servicoRepository.findById(servico.getId())).thenReturn(Optional.empty());

        AgendamentoCreateRequestDto dto = new AgendamentoCreateRequestDto(
                cliente.getId(), servico.getId(), usuario.getId(), dataFutura, hi, hf, null
        );

        assertThatThrownBy(() -> service.criar(dto)).isInstanceOf(NotFoundException.class);
        verify(agendamentoRepository, never()).save(any());
    }

    @Test
    void criar_usuarioNaoEncontrado_lancaNotFound() {
        when(clienteRepository.findById(cliente.getId())).thenReturn(Optional.of(cliente));
        when(servicoRepository.findById(servico.getId())).thenReturn(Optional.of(servico));
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.empty());

        AgendamentoCreateRequestDto dto = new AgendamentoCreateRequestDto(
                cliente.getId(), servico.getId(), usuario.getId(), dataFutura, hi, hf, null
        );

        assertThatThrownBy(() -> service.criar(dto)).isInstanceOf(NotFoundException.class);
        verify(agendamentoRepository, never()).save(any());
    }

    // ─────────────────────────────────────────────────────────────
    // buscarPorId
    // ─────────────────────────────────────────────────────────────

    @Test
    void buscarPorId_idNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.buscarPorId(null)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void buscarPorId_idZero_lancaBadRequest() {
        assertThatThrownBy(() -> service.buscarPorId(0)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void buscarPorId_naoEncontrado_lancaNotFound() {
        when(agendamentoRepository.findByIdWithRelations(1)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.buscarPorId(1)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void buscarPorId_sucesso_retornaDto() {
        Agendamento a = agendamentoAgendado(42, usuario, servico, cliente);
        when(agendamentoRepository.findByIdWithRelations(42)).thenReturn(Optional.of(a));

        AgendamentoResponseDto dto = service.buscarPorId(42);

        assertThat(dto.id()).isEqualTo(42);
        assertThat(dto.status()).isEqualTo(StatusAgendamentoEnum.AGENDADO);
    }

    // ─────────────────────────────────────────────────────────────
    // cancelar – caminhos adicionais
    // ─────────────────────────────────────────────────────────────

    @Test
    void cancelar_idNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.cancelar(null)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void cancelar_naoEncontrado_lancaNotFound() {
        when(agendamentoRepository.findByIdWithRelations(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.cancelar(99)).isInstanceOf(NotFoundException.class);
    }

    // ─────────────────────────────────────────────────────────────
    // concluir – caminhos adicionais
    // ─────────────────────────────────────────────────────────────

    @Test
    void concluir_idNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.concluir(null)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void concluir_naoEncontrado_lancaNotFound() {
        when(agendamentoRepository.findByIdWithRelations(99)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.concluir(99)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void concluir_statusInvalido_lancaUnprocessable() {
        Agendamento a = agendamentoAgendado(3, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CANCELADO);
        when(agendamentoRepository.findByIdWithRelations(3)).thenReturn(Optional.of(a));

        assertThatThrownBy(() -> service.concluir(3)).isInstanceOf(UnprocessableEntityException.class);
        verify(notificacaoClient, never()).descartarConfirmacaoElembreteParaAgendamento(any());
    }

    // ─────────────────────────────────────────────────────────────
    // remarcar – caminhos adicionais
    // ─────────────────────────────────────────────────────────────

    @Test
    void remarcar_idNulo_lancaBadRequest() {
        AgendamentoRemarcarRequestDto dto =
                new AgendamentoRemarcarRequestDto(dataFutura, hi, hf, null, null);
        assertThatThrownBy(() -> service.remarcar(null, dto)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void remarcar_dtoNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.remarcar(1, null)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void remarcar_naoEncontrado_lancaNotFound() {
        when(agendamentoRepository.findByIdWithRelations(9)).thenReturn(Optional.empty());
        AgendamentoRemarcarRequestDto dto =
                new AgendamentoRemarcarRequestDto(dataFutura, hi, hf, null, null);
        assertThatThrownBy(() -> service.remarcar(9, dto)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void remarcar_statusInvalido_lancaUnprocessable() {
        Agendamento a = agendamentoAgendado(10, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CONCLUIDO);
        when(agendamentoRepository.findByIdWithRelations(10)).thenReturn(Optional.of(a));
        AgendamentoRemarcarRequestDto dto =
                new AgendamentoRemarcarRequestDto(dataFutura, hi, hf, null, null);

        assertThatThrownBy(() -> service.remarcar(10, dto)).isInstanceOf(UnprocessableEntityException.class);
        verify(notificacaoClient, never()).descartarConfirmacaoElembreteParaAgendamento(any());
        verify(eventPublisher, never()).publishEvent(any());
    }

    @Test
    void remarcar_conflitoDeHorario_lancaConflict() {
        Agendamento a = agendamentoAgendado(11, usuario, servico, cliente);
        when(agendamentoRepository.findByIdWithRelations(11)).thenReturn(Optional.of(a));
        when(agendamentoRepository.countAgendamentosConflitantes(
                eq(usuario.getId()), eq(dataFutura), eq(hi), eq(hf),
                eq(11), eq(StatusAgendamentoEnum.CANCELADO)
        )).thenReturn(2L);
        AgendamentoRemarcarRequestDto dto =
                new AgendamentoRemarcarRequestDto(dataFutura, hi, hf, null, null);

        assertThatThrownBy(() -> service.remarcar(11, dto)).isInstanceOf(ConflictException.class);
        verify(notificacaoClient).descartarConfirmacaoElembreteParaAgendamento(11);
        verify(agendamentoRepository, never()).save(any());
    }

    @Test
    void remarcar_novoServico_sucesso_atualizaServico() {
        Servico novoServico = new Servico();
        novoServico.setId(55);
        novoServico.setNome("Yoga");
        novoServico.setTipo("individual");
        novoServico.setPreco(java.math.BigDecimal.valueOf(100));

        Agendamento a = agendamentoAgendado(12, usuario, servico, cliente);
        when(agendamentoRepository.findByIdWithRelations(12)).thenReturn(Optional.of(a));
        when(servicoRepository.findById(55)).thenReturn(Optional.of(novoServico));
        when(agendamentoRepository.countAgendamentosConflitantes(
                eq(usuario.getId()), eq(dataFutura), eq(hi), eq(hf),
                eq(12), eq(StatusAgendamentoEnum.CANCELADO)
        )).thenReturn(0L);
        when(agendamentoRepository.save(any(Agendamento.class))).thenAnswer(inv -> {
            Agendamento x = inv.getArgument(0);
            x.setId(12);
            return x;
        });

        AgendamentoRemarcarRequestDto dto =
                new AgendamentoRemarcarRequestDto(dataFutura, hi, hf, null, 55);

        AgendamentoResponseDto resultado = service.remarcar(12, dto);

        assertThat(resultado.id()).isEqualTo(12);
        assertThat(a.getServico()).isEqualTo(novoServico);
    }

    // ─────────────────────────────────────────────────────────────
    // aplicarRespostaWhatsappInbound – caminhos adicionais
    // ─────────────────────────────────────────────────────────────

    @Test
    void aplicarRespostaWhatsapp_idNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.aplicarRespostaWhatsappInbound(null, RespostaWhatsappTipoEnum.SIM))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void aplicarRespostaWhatsapp_tipoNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.aplicarRespostaWhatsappInbound(1, null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void aplicarRespostaWhatsapp_naoEncontrado_lancaNotFound() {
        when(agendamentoRepository.findById(77)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.aplicarRespostaWhatsappInbound(77, RespostaWhatsappTipoEnum.SIM))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void aplicarRespostaWhatsapp_sim_comConfirmado_ignoraDuplicidade_semUpdateNemDescarte() {
        Agendamento a = agendamentoAgendado(60, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CONFIRMADO);
        when(agendamentoRepository.findById(60)).thenReturn(Optional.of(a));

        service.aplicarRespostaWhatsappInbound(60, RespostaWhatsappTipoEnum.SIM);

        verify(agendamentoRepository, never()).atualizarStatusDireto(any(), any());
        verify(notificacaoClient, never()).descartarSomenteConfirmacaoParaAgendamento(any());
    }

    @Test
    void aplicarRespostaWhatsapp_sim_comCancelado_semEfeito_semUpdate() {
        Agendamento a = agendamentoAgendado(61, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CANCELADO);
        when(agendamentoRepository.findById(61)).thenReturn(Optional.of(a));

        service.aplicarRespostaWhatsappInbound(61, RespostaWhatsappTipoEnum.SIM);

        verify(agendamentoRepository, never()).atualizarStatusDireto(any(), any());
    }

    @Test
    void aplicarRespostaWhatsapp_nao_comConcluido_semEfeito_semUpdate() {
        Agendamento a = agendamentoAgendado(62, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CONCLUIDO);
        when(agendamentoRepository.findById(62)).thenReturn(Optional.of(a));

        service.aplicarRespostaWhatsappInbound(62, RespostaWhatsappTipoEnum.NAO);

        verify(agendamentoRepository, never()).atualizarStatusDireto(any(), any());
        verify(notificacaoClient, never()).descartarConfirmacaoElembreteParaAgendamento(any());
    }

    // ─────────────────────────────────────────────────────────────
    // bloquearPeriodo
    // ─────────────────────────────────────────────────────────────

    @Test
    void bloquearPeriodo_dtoNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.bloquearPeriodo(null)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void bloquearPeriodo_usuarioNaoEncontrado_lancaNotFound() {
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.empty());
        AgendamentoBloquearPeriodoRequestDto dto = new AgendamentoBloquearPeriodoRequestDto(
                usuario.getId(), dataFutura, hi, hf
        );
        assertThatThrownBy(() -> service.bloquearPeriodo(dto)).isInstanceOf(NotFoundException.class);
    }

    @Test
    void bloquearPeriodo_intervaloInvalido_lancaUnprocessable() {
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        AgendamentoBloquearPeriodoRequestDto dto = new AgendamentoBloquearPeriodoRequestDto(
                usuario.getId(), dataFutura, LocalTime.of(10, 0), LocalTime.of(10, 0)
        );
        assertThatThrownBy(() -> service.bloquearPeriodo(dto)).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    void bloquearPeriodo_conflito_lancaConflict() {
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(agendamentoRepository.countAgendamentosConflitantes(
                eq(usuario.getId()), eq(dataFutura), eq(hi), eq(hf),
                eq(null), eq(StatusAgendamentoEnum.CANCELADO)
        )).thenReturn(1L);

        AgendamentoBloquearPeriodoRequestDto dto = new AgendamentoBloquearPeriodoRequestDto(
                usuario.getId(), dataFutura, hi, hf
        );
        assertThatThrownBy(() -> service.bloquearPeriodo(dto)).isInstanceOf(ConflictException.class);
        verify(agendamentoRepository, never()).save(any());
    }

    @Test
    void bloquearPeriodo_sucesso_salvaBloqueioComStatusBloqueado() {
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(agendamentoRepository.countAgendamentosConflitantes(
                eq(usuario.getId()), eq(dataFutura), eq(hi), eq(hf),
                eq(null), eq(StatusAgendamentoEnum.CANCELADO)
        )).thenReturn(0L);

        AgendamentoBloquearPeriodoRequestDto dto = new AgendamentoBloquearPeriodoRequestDto(
                usuario.getId(), dataFutura, hi, hf
        );
        service.bloquearPeriodo(dto);

        ArgumentCaptor<Agendamento> captor = ArgumentCaptor.forClass(Agendamento.class);
        verify(agendamentoRepository).save(captor.capture());
        assertThat(captor.getValue().getStatus()).isEqualTo(StatusAgendamentoEnum.BLOQUEADO);
        assertThat(captor.getValue().getCliente()).isNull();
        assertThat(captor.getValue().getServico()).isNull();
    }

    // ─────────────────────────────────────────────────────────────
    // listarPorStatusEPeriodo
    // ─────────────────────────────────────────────────────────────

    @Test
    void listarPorStatusEPeriodo_statusNulo_lancaBadRequest() {
        assertThatThrownBy(() ->
                service.listarPorStatusEPeriodo(null, LocalDate.now(Z), LocalDate.now(Z).plusDays(1))
        ).isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarPorStatusEPeriodo_dataInicioNula_lancaBadRequest() {
        assertThatThrownBy(() ->
                service.listarPorStatusEPeriodo(StatusAgendamentoEnum.AGENDADO, null, LocalDate.now(Z))
        ).isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarPorStatusEPeriodo_sucesso_retornaLista() {
        LocalDate inicio = LocalDate.now(Z);
        LocalDate fim = inicio.plusDays(3);
        Agendamento a = agendamentoAgendado(70, usuario, servico, cliente);
        when(agendamentoRepository.findByStatusAndDataBetweenOrderByDataAscHoraInicioAsc(
                StatusAgendamentoEnum.AGENDADO, inicio, fim
        )).thenReturn(List.of(a));

        List<AgendamentoResponseDto> result =
                service.listarPorStatusEPeriodo(StatusAgendamentoEnum.AGENDADO, inicio, fim);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().id()).isEqualTo(70);
    }

    // ─────────────────────────────────────────────────────────────
    // listarPorCliente
    // ─────────────────────────────────────────────────────────────

    @Test
    void listarPorCliente_clienteIdNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.listarPorCliente(null)).isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarPorCliente_sucesso_retornaLista() {
        Agendamento a = agendamentoAgendado(71, usuario, servico, cliente);
        when(agendamentoRepository.findByClienteIdWithDetails(cliente.getId())).thenReturn(List.of(a));

        List<AgendamentoResponseDto> result = service.listarPorCliente(cliente.getId());

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().id()).isEqualTo(71);
    }

    // ─────────────────────────────────────────────────────────────
    // listarParaLembrete
    // ─────────────────────────────────────────────────────────────

    @Test
    void listarParaLembrete_dataNula_lancaBadRequest() {
        assertThatThrownBy(() -> service.listarParaLembrete(null, null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarParaLembrete_statusNulo_usaAgendado() {
        LocalDate hoje = LocalDate.now(Z);
        Agendamento a = agendamentoAgendado(72, usuario, servico, cliente);
        when(agendamentoRepository.findAgendamentosParaLembrete(hoje, StatusAgendamentoEnum.AGENDADO))
                .thenReturn(List.of(a));

        List<AgendamentoResponseDto> result = service.listarParaLembrete(hoje, null);

        assertThat(result).hasSize(1);
        verify(agendamentoRepository).findAgendamentosParaLembrete(hoje, StatusAgendamentoEnum.AGENDADO);
    }

    @Test
    void listarParaLembrete_statusExplicito_usaStatusInformado() {
        LocalDate hoje = LocalDate.now(Z);
        Agendamento a = agendamentoAgendado(73, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CONFIRMADO);
        when(agendamentoRepository.findAgendamentosParaLembrete(hoje, StatusAgendamentoEnum.CONFIRMADO))
                .thenReturn(List.of(a));

        List<AgendamentoResponseDto> result = service.listarParaLembrete(hoje, StatusAgendamentoEnum.CONFIRMADO);

        assertThat(result).hasSize(1);
        verify(agendamentoRepository).findAgendamentosParaLembrete(hoje, StatusAgendamentoEnum.CONFIRMADO);
    }

    // ─────────────────────────────────────────────────────────────
    // listarConfirmadosParaLembrete
    // ─────────────────────────────────────────────────────────────

    @Test
    void listarConfirmadosParaLembrete_dataNula_lancaBadRequest() {
        assertThatThrownBy(() -> service.listarConfirmadosParaLembrete(null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarConfirmadosParaLembrete_sucesso_retornaDto() {
        LocalDate hoje = LocalDate.now(Z);
        Agendamento a = agendamentoAgendado(74, usuario, servico, cliente);
        a.setStatus(StatusAgendamentoEnum.CONFIRMADO);
        when(agendamentoRepository.findAgendamentosParaLembrete(hoje, StatusAgendamentoEnum.CONFIRMADO))
                .thenReturn(List.of(a));

        var result = service.listarConfirmadosParaLembrete(hoje);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().agendamentoId()).isEqualTo(74);
        assertThat(result.getFirst().telefoneCliente()).isEqualTo(cliente.getTelefone());
        assertThat(result.getFirst().horaInicio()).isEqualTo(LocalTime.of(9, 0));
    }

    // ─────────────────────────────────────────────────────────────
    // verificarConflitoHorario
    // ─────────────────────────────────────────────────────────────

    @Test
    void verificarConflitoHorario_usuarioIdNulo_lancaBadRequest() {
        assertThatThrownBy(() ->
                service.verificarConflitoHorario(null, LocalDate.now(Z), hi, hf, null)
        ).isInstanceOf(BadRequestException.class);
    }

    @Test
    void verificarConflitoHorario_dataNula_lancaBadRequest() {
        assertThatThrownBy(() ->
                service.verificarConflitoHorario(usuario.getId(), null, hi, hf, null)
        ).isInstanceOf(BadRequestException.class);
    }

    @Test
    void verificarConflitoHorario_intervaloInvalido_lancaUnprocessable() {
        assertThatThrownBy(() ->
                service.verificarConflitoHorario(usuario.getId(), dataFutura, hf, hi, null)
        ).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    void verificarConflitoHorario_semConflito_retornaZero() {
        when(agendamentoRepository.countAgendamentosConflitantes(
                eq(usuario.getId()), eq(dataFutura), eq(hi), eq(hf),
                eq(null), eq(StatusAgendamentoEnum.CANCELADO)
        )).thenReturn(0L);

        VerificacaoConflitoAgendamentoResponseDto result =
                service.verificarConflitoHorario(usuario.getId(), dataFutura, hi, hf, null);

        assertThat(result.quantidadeConflitos()).isEqualTo(0L);
    }

    @Test
    void verificarConflitoHorario_comConflito_retornaContagem() {
        when(agendamentoRepository.countAgendamentosConflitantes(
                eq(usuario.getId()), eq(dataFutura), eq(hi), eq(hf),
                eq(5), eq(StatusAgendamentoEnum.CANCELADO)
        )).thenReturn(3L);

        VerificacaoConflitoAgendamentoResponseDto result =
                service.verificarConflitoHorario(usuario.getId(), dataFutura, hi, hf, 5);

        assertThat(result.quantidadeConflitos()).isEqualTo(3L);
    }

    // ─────────────────────────────────────────────────────────────
    // listarSlotsDisponiveis – caminhos adicionais
    // ─────────────────────────────────────────────────────────────

    @Test
    void listarSlotsDisponiveis_usuarioIdNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.listarSlotsDisponiveis(null, dataFutura, 60))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarSlotsDisponiveis_dataNula_lancaBadRequest() {
        assertThatThrownBy(() -> service.listarSlotsDisponiveis(usuario.getId(), null, 60))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarSlotsDisponiveis_duracaoMuitoPequena_lancaUnprocessable() {
        assertThatThrownBy(() -> service.listarSlotsDisponiveis(usuario.getId(), dataFutura, 14))
                .isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    void listarSlotsDisponiveis_duracaoMuitoGrande_lancaUnprocessable() {
        assertThatThrownBy(() -> service.listarSlotsDisponiveis(usuario.getId(), dataFutura, 481))
                .isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    void listarSlotsDisponiveis_usuarioNaoEncontrado_lancaNotFound() {
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.listarSlotsDisponiveis(usuario.getId(), dataFutura, 60))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void listarSlotsDisponiveis_horarioFuncionamentoInvalido_lancaUnprocessable() {
        Estabelecimento estabInvalido = new Estabelecimento();
        estabInvalido.setId(99);
        estabInvalido.setNome("X");
        estabInvalido.setEndereco("Y");
        estabInvalido.setInicioFuncionamento(LocalTime.of(22, 0));
        estabInvalido.setFimFuncionamento(LocalTime.of(6, 0));

        Usuario usuarioInvalido = criarUsuario(99, estabInvalido);
        when(usuarioRepository.findById(99)).thenReturn(Optional.of(usuarioInvalido));

        assertThatThrownBy(() -> service.listarSlotsDisponiveis(99, dataFutura, 60))
                .isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    void listarSlotsDisponiveis_todosNoPassado_retornaListaVazia() {
        LocalDate ontem = LocalDate.now(Z).minusDays(1);
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));

        List<HorarioSlotResponseDto> livres =
                service.listarSlotsDisponiveis(usuario.getId(), ontem, 60);

        assertThat(livres).isEmpty();
    }

    // ─────────────────────────────────────────────────────────────
    // listarDiasValidos – caminhos adicionais
    // ─────────────────────────────────────────────────────────────

    @Test
    void listarDiasValidos_sabado_disponivelFalseESemChamadaAoRepositorio() {
        LocalDate sabado = LocalDate.of(2026, 5, 23); // sábado
        when(feriadosPort.buscarFeriados(sabado.getYear())).thenReturn(Set.of());

        List<DiaValidoPeriodoResponseDto> result =
                service.listarDiasValidos(usuario.getId(), sabado, sabado);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().disponivel()).isFalse();
        verify(usuarioRepository, never()).findById(any());
    }

    @Test
    void listarDiasValidos_domingo_disponivelFalse() {
        LocalDate domingo = LocalDate.of(2026, 5, 24); // domingo
        when(feriadosPort.buscarFeriados(domingo.getYear())).thenReturn(Set.of());

        List<DiaValidoPeriodoResponseDto> result =
                service.listarDiasValidos(usuario.getId(), domingo, domingo);

        assertThat(result.getFirst().disponivel()).isFalse();
    }

    @Test
    void listarDiasValidos_dataInicioNula_lancaBadRequest() {
        assertThatThrownBy(() ->
                service.listarDiasValidos(usuario.getId(), null, LocalDate.now(Z))
        ).isInstanceOf(BadRequestException.class);
    }

    @Test
    void listarDiasValidos_periodoInvertido_lancaUnprocessable() {
        LocalDate inicio = LocalDate.now(Z).plusDays(5);
        LocalDate fim = LocalDate.now(Z).plusDays(1);

        assertThatThrownBy(() -> service.listarDiasValidos(usuario.getId(), inicio, fim))
                .isInstanceOf(UnprocessableEntityException.class);
    }

    // ─────────────────────────────────────────────────────────────
    // calcularTaxaOcupacao
    // ─────────────────────────────────────────────────────────────

    @Test
    void calcularTaxaOcupacao_usuarioIdNulo_lancaBadRequest() {
        assertThatThrownBy(() ->
                service.calcularTaxaOcupacao(null, LocalDate.now(Z), LocalDate.now(Z).plusDays(5), 60)
        ).isInstanceOf(BadRequestException.class);
    }

    @Test
    void calcularTaxaOcupacao_dataInicioNula_lancaBadRequest() {
        assertThatThrownBy(() ->
                service.calcularTaxaOcupacao(usuario.getId(), null, LocalDate.now(Z), 60)
        ).isInstanceOf(BadRequestException.class);
    }

    @Test
    void calcularTaxaOcupacao_duracaoInvalida_lancaUnprocessable() {
        assertThatThrownBy(() ->
                service.calcularTaxaOcupacao(usuario.getId(), LocalDate.now(Z),
                        LocalDate.now(Z).plusDays(1), 500)
        ).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    void calcularTaxaOcupacao_usuarioNaoEncontrado_lancaNotFound() {
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.empty());
        assertThatThrownBy(() ->
                service.calcularTaxaOcupacao(usuario.getId(), LocalDate.now(Z),
                        LocalDate.now(Z).plusDays(1), 60)
        ).isInstanceOf(NotFoundException.class);
    }

    @Test
    void calcularTaxaOcupacao_horarioFuncionamentoInvalido_lancaUnprocessable() {
        Estabelecimento estabInvalido = new Estabelecimento();
        estabInvalido.setId(99);
        estabInvalido.setNome("X");
        estabInvalido.setEndereco("Y");
        estabInvalido.setInicioFuncionamento(LocalTime.of(18, 0));
        estabInvalido.setFimFuncionamento(LocalTime.of(8, 0));
        Usuario u = criarUsuario(99, estabInvalido);
        when(usuarioRepository.findById(99)).thenReturn(Optional.of(u));

        assertThatThrownBy(() ->
                service.calcularTaxaOcupacao(99, LocalDate.now(Z), LocalDate.now(Z).plusDays(1), 60)
        ).isInstanceOf(UnprocessableEntityException.class);
    }

    @Test
    void calcularTaxaOcupacao_sucesso_retornaTaxaCorreta() {
        LocalDate inicio = LocalDate.of(2026, 6, 1);
        LocalDate fim = LocalDate.of(2026, 6, 1); // 1 dia

        // Estabelecimento: 6h–22h = 16 horas; dur=60 → 16 slots/dia; 1 dia → capacidade=16
        when(usuarioRepository.findById(usuario.getId())).thenReturn(Optional.of(usuario));
        when(agendamentoRepository.countByUsuarioIdAndDataBetweenAndStatusNotIn(
                eq(usuario.getId()), eq(inicio), eq(fim), any()
        )).thenReturn(8L);

        TaxaOcupacaoResponseDto result =
                service.calcularTaxaOcupacao(usuario.getId(), inicio, fim, 60);

        assertThat(result.totalAgendamentos()).isEqualTo(8L);
        assertThat(result.capacidadeMaxima()).isEqualTo(16L);
        assertThat(result.taxaOcupacaoPercent()).isEqualTo(50.0);
    }

    @Test
    void calcularTaxaOcupacao_capacidadeZero_retornaZeroTaxa() {
        // Estabelecimento com 6h–22h = 16h, mas dur=480min (8h) → 16*60/480 = 2 slots
        // Se sobrescrevermos com janela de 30 min e dur=60: slotsPorDia = 0
        Estabelecimento estabCurto = new Estabelecimento();
        estabCurto.setId(88);
        estabCurto.setNome("Mini");
        estabCurto.setEndereco("Z");
        estabCurto.setInicioFuncionamento(LocalTime.of(10, 0));
        estabCurto.setFimFuncionamento(LocalTime.of(10, 30)); // só 30 min
        Usuario uCurto = criarUsuario(88, estabCurto);
        when(usuarioRepository.findById(88)).thenReturn(Optional.of(uCurto));

        LocalDate dia = LocalDate.of(2026, 6, 2);
        TaxaOcupacaoResponseDto result = service.calcularTaxaOcupacao(88, dia, dia, 60);

        assertThat(result.capacidadeMaxima()).isEqualTo(0L);
        assertThat(result.taxaOcupacaoPercent()).isEqualTo(0.0);
    }

    // ─────────────────────────────────────────────────────────────
    // helpers
    // ─────────────────────────────────────────────────────────────

    private static LocalDate proximoDiaUtil(LocalDate aPartirDe) {
        LocalDate dia = aPartirDe;
        while (dia.getDayOfWeek() == DayOfWeek.SATURDAY || dia.getDayOfWeek() == DayOfWeek.SUNDAY) {
            dia = dia.plusDays(1);
        }
        return dia;
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
