package br.com.fisasaude.notificacao.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import br.com.fisasaude.notificacao.integration.agendamento.AgendamentoIntegracaoCliente;
import br.com.fisasaude.notificacao.integration.twilio.TwilioWhatsappSender;
import br.com.fisasaude.notificacao.model.entity.Agendamento;
import br.com.fisasaude.notificacao.model.entity.Cliente;
import br.com.fisasaude.notificacao.model.enums.RespostaWhatsappTipoEnum;
import br.com.fisasaude.notificacao.model.enums.SexoEnum;
import br.com.fisasaude.notificacao.model.enums.StatusAgendamentoEnum;
import br.com.fisasaude.notificacao.repository.AgendamentoRepository;
import br.com.fisasaude.notificacao.repository.ClienteRepository;
import br.com.fisasaude.notificacao.repository.MensagemRespostaWhatsappRepository;
import br.com.fisasaude.notificacao.repository.NotificacaoRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class WhatsAppInboundServiceTest {

    private static final ZoneId TZ_BR = ZoneId.of("America/Sao_Paulo");

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @Mock
    private NotificacaoRepository notificacaoRepository;

    @Mock
    private MensagemRespostaWhatsappRepository mensagemRepository;

    @Mock
    private NotificacaoDispatchService dispatchService;

    @Mock
    private AgendamentoIntegracaoCliente agendamentoIntegracaoCliente;

    @Mock
    private TwilioWhatsappSender twilioWhatsappSender;

    @Mock
    private NotificacaoAppProperties props;

    @InjectMocks
    private WhatsAppInboundService service;

    @BeforeEach
    void setProps() {
        when(props.getTimezone()).thenReturn("America/Sao_Paulo");
        when(agendamentoIntegracaoCliente.notificarRespostaWhatsapp(anyInt(), any())).thenReturn(true);
    }

    @Test
    void sim_via_payload_CONFIRMAR_correlacao_exata_enviaAoDominioAgendamento() {
        Cliente cliente = clienteCompleto();

        LocalDate dia = LocalDate.now(TZ_BR).plusDays(1);
        Agendamento ag = novoAgendamento(100, StatusAgendamentoEnum.AGENDADO, cliente, dia, LocalTime.of(9, 0));

        when(agendamentoRepository.findByIdWithRelations(100)).thenReturn(Optional.of(ag));
        when(mensagemRepository.existsByTwilioMessageSid("SID-SIM")).thenReturn(false);

        stubReferences();

        service.processarEntradaPaciente(
                "whatsapp:+5511888887777",
                "5511888887777",
                "",
                "SID-SIM",
                "CONFIRMAR_100",
                "Confirmar",
                null);

        verify(mensagemRepository).save(any());
        verify(agendamentoIntegracaoCliente).notificarRespostaWhatsapp(100, RespostaWhatsappTipoEnum.SIM);
        verify(dispatchService, never()).descartarSomenteConfirmacaoParaAgendamento(any());
        verify(dispatchService, never()).descartarConfirmacaoElembreteParaAgendamento(any());
        verify(dispatchService, never())
                .enviarAvisoRecepcaoPacienteNegativo(anyInt(), any(), any(), any(), any());

        assertThat(ag.getStatus()).isEqualTo(StatusAgendamentoEnum.AGENDADO);
        verify(agendamentoRepository, never()).save(ag);
    }

    @Test
    void nao_via_CORRELACAO_TEXTO_enviaAoDominioEAlertaRecepcao() {
        Cliente cliente = clienteCompleto();
        LocalDate dia = LocalDate.now(TZ_BR).plusDays(2);
        Agendamento ag = novoAgendamento(200, StatusAgendamentoEnum.AGENDADO, cliente, dia, LocalTime.of(14, 30));

        when(agendamentoRepository.findByIdWithRelations(200)).thenReturn(Optional.of(ag));
        when(mensagemRepository.existsByTwilioMessageSid("SID-NAO")).thenReturn(false);
        stubReferences();

        service.processarEntradaPaciente(
                "whatsapp:+5511888887777", "5511888887777", "NAO 200 ", "SID-NAO", "", "", null);

        verify(mensagemRepository).save(any());
        verify(agendamentoIntegracaoCliente).notificarRespostaWhatsapp(200, RespostaWhatsappTipoEnum.NAO);

        assertThat(ag.getStatus()).isEqualTo(StatusAgendamentoEnum.AGENDADO);

        verify(dispatchService, never()).descartarConfirmacaoElembreteParaAgendamento(any());
        verify(dispatchService, never()).descartarSomenteConfirmacaoParaAgendamento(any());
        verify(dispatchService)
                .enviarAvisoRecepcaoPacienteNegativo(
                        eq(200), eq("Paciente 9"), eq(dia), eq("14:30"), eq("5511888887777"));
        verify(agendamentoRepository, never()).save(ag);
    }

    @Test
    void texto_sim_sem_id_auto_seleciona_agendamento_mais_recente() {
        Cliente cliente = clienteCompleto();
        Agendamento ag = novoAgendamento(210, StatusAgendamentoEnum.AGENDADO, cliente, LocalDate.now(TZ_BR).plusDays(3), LocalTime.of(16, 0));
        when(clienteRepository.findAll()).thenReturn(List.of(cliente));
        when(agendamentoRepository.findByClienteIdInAndStatusOrderByMaisRecente(List.of(9), StatusAgendamentoEnum.AGENDADO))
                .thenReturn(List.of(ag));
        when(agendamentoRepository.findByIdWithRelations(210)).thenReturn(Optional.of(ag));
        when(mensagemRepository.existsByTwilioMessageSid("SID-X")).thenReturn(false);
        stubReferences();

        service.processarEntradaPaciente("whatsapp:+5511888887777", "5511888887777", "sim", "SID-X", "", "", null);

        verify(mensagemRepository).save(any());
        verify(agendamentoIntegracaoCliente).notificarRespostaWhatsapp(210, RespostaWhatsappTipoEnum.SIM);
        verify(twilioWhatsappSender)
                .enviarTextoParaWhatsapp(
                        "5511888887777",
                        "✅ Agendamento confirmado com sucesso! Te esperamos 👍\n\nProtocolo: AG210");
    }

    @Test
    void sim_com_id_escolhe_agendamento_mesmo_com_varios_clientes_mesmo_telefone() {
        Cliente c2 = clienteComId(2, "5511965643020");
        Agendamento ag8 = novoAgendamento(8, StatusAgendamentoEnum.AGENDADO, c2, LocalDate.now(TZ_BR).plusDays(2), LocalTime.of(11, 0));

        when(agendamentoRepository.findByIdWithRelations(8)).thenReturn(Optional.of(ag8));
        when(mensagemRepository.existsByTwilioMessageSid("SID-SIM8")).thenReturn(false);
        stubReferences();

        service.processarEntradaPaciente(
                "whatsapp:+5511965643020",
                "5511965643020",
                "SIM 8",
                "SID-SIM8",
                "",
                "",
                null);

        verify(agendamentoIntegracaoCliente).notificarRespostaWhatsapp(8, RespostaWhatsappTipoEnum.SIM);
        verify(twilioWhatsappSender)
                .enviarTextoParaWhatsapp(
                        "5511965643020",
                        "✅ Agendamento confirmado com sucesso! Te esperamos 👍\n\nProtocolo: AG8");
        verify(agendamentoIntegracaoCliente, never()).notificarRespostaWhatsapp(1, RespostaWhatsappTipoEnum.SIM);
    }

    @Test
    void sim_sem_id_escolhe_agendamento_mais_recente_entre_clientes_mesmo_telefone() {
        Cliente c1 = clienteComId(1, "5511965643020");
        Cliente c2 = clienteComId(2, "5511965643020");
        Agendamento ag1 = novoAgendamento(1, StatusAgendamentoEnum.AGENDADO, c1, LocalDate.now(TZ_BR).plusDays(1), LocalTime.of(9, 0));
        Agendamento ag8 = novoAgendamento(8, StatusAgendamentoEnum.AGENDADO, c2, LocalDate.now(TZ_BR).plusDays(2), LocalTime.of(11, 0));

        when(clienteRepository.findAll()).thenReturn(List.of(c1, c2));
        when(agendamentoRepository.findByClienteIdInAndStatusOrderByMaisRecente(List.of(1, 2), StatusAgendamentoEnum.AGENDADO))
                .thenReturn(List.of(ag8, ag1));
        when(agendamentoRepository.findByIdWithRelations(8)).thenReturn(Optional.of(ag8));
        when(mensagemRepository.existsByTwilioMessageSid("SID-SIM-SIMPLES")).thenReturn(false);
        stubReferences();

        service.processarEntradaPaciente(
                "whatsapp:+5511965643020",
                "5511965643020",
                "SIM",
                "SID-SIM-SIMPLES",
                "",
                "",
                null);

        verify(agendamentoIntegracaoCliente).notificarRespostaWhatsapp(8, RespostaWhatsappTipoEnum.SIM);
        verify(twilioWhatsappSender)
                .enviarTextoParaWhatsapp(
                        "5511965643020",
                        "✅ Agendamento confirmado com sucesso! Te esperamos 👍\n\nProtocolo: AG8");
    }

    @Test
    void quando_integracao_falha_nao_envia_confirmacao_falsa() {
        Cliente cliente = clienteCompleto();
        Agendamento ag = novoAgendamento(211, StatusAgendamentoEnum.AGENDADO, cliente, LocalDate.now(TZ_BR).plusDays(4), LocalTime.of(10, 0));
        when(clienteRepository.findAll()).thenReturn(List.of(cliente));
        when(agendamentoRepository.findByClienteIdInAndStatusOrderByMaisRecente(List.of(9), StatusAgendamentoEnum.AGENDADO))
                .thenReturn(List.of(ag));
        when(agendamentoRepository.findByIdWithRelations(211)).thenReturn(Optional.of(ag));
        when(mensagemRepository.existsByTwilioMessageSid("SID-FAIL")).thenReturn(false);
        when(agendamentoIntegracaoCliente.notificarRespostaWhatsapp(211, RespostaWhatsappTipoEnum.SIM))
                .thenReturn(false);
        stubReferences();

        service.processarEntradaPaciente("whatsapp:+5511888887777", "5511888887777", "SIM", "SID-FAIL", "", "", null);

        verify(twilioWhatsappSender)
                .enviarTextoParaWhatsapp(
                        "5511888887777",
                        "⚠️ Recebemos sua resposta (AG211), mas não foi possível confirmar no sistema agora.\n"
                                + "A recepção foi alertada. Você também pode ligar para confirmar.");
    }

    private void stubReferences() {
        when(agendamentoRepository.getReferenceById(anyInt()))
                .thenAnswer(inv -> {
                    Integer id = inv.getArgument(0);
                    Agendamento r = new Agendamento();
                    r.setId(id);
                    return r;
                });
        when(clienteRepository.getReferenceById(anyInt()))
                .thenAnswer(inv -> {
                    Cliente r = new Cliente();
                    r.setId(inv.getArgument(0));
                    return r;
                });
    }

    private static Cliente clienteCompleto() {
        return clienteComId(9, "5511888887777");
    }

    private static Cliente clienteComId(int id, String telefone) {
        Cliente c = new Cliente();
        c.setId(id);
        c.setNome("Paciente " + id);
        c.setTelefone(telefone);
        c.setDataNascimento(LocalDate.of(1990, 1, 5));
        c.setSexo(SexoEnum.F);
        return c;
    }

    private static Agendamento novoAgendamento(
            int id,
            StatusAgendamentoEnum status,
            Cliente cliente,
            LocalDate dia,
            LocalTime hora) {
        Agendamento a = new Agendamento();
        a.setId(id);
        a.setStatus(status);
        a.setCliente(cliente);
        a.setData(dia);
        a.setHoraInicio(hora);
        LocalDateTime dt = LocalDateTime.now(TZ_BR);
        a.setCriadoEm(dt);
        a.setAtualizadoEm(dt);
        return a;
    }
}
