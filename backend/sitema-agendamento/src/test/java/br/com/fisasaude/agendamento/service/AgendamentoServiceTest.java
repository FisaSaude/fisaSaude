package br.com.fisasaude.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.request.AgendamentoRemarcarRequestDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.AgendamentoUsuarioPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.DiaValidoPeriodoResponseDto;
import br.com.fisasaude.agendamento.dto.agendamento.response.HorarioSlotResponseDto;
import br.com.fisasaude.agendamento.event.AgendamentoNotificacaoConfirmacaoEvent;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.ConflictException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.exception.UnprocessableEntityException;
import br.com.fisasaude.agendamento.feignclient.ApiFeriados;
import br.com.fisasaude.agendamento.feignclient.FeriadoDto;
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
    private ApiFeriados apiFeriados;

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
        when(apiFeriados.listarFeriados(dia.getYear())).thenReturn(List.of());
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
        when(apiFeriados.listarFeriados(feriado.getYear()))
                .thenReturn(List.of(new FeriadoDto(feriado, "Confraternizacao Universal", "national")));

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
