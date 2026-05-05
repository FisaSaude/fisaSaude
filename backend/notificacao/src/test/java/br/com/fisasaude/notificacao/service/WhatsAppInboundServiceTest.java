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
    private NotificacaoAppProperties props;

    @InjectMocks
    private WhatsAppInboundService service;

    @BeforeEach
    void setProps() {
        when(props.getTimezone()).thenReturn("America/Sao_Paulo");
    }

    @Test
    void sim_via_payload_CONFIRMAR_correlacao_exata_enviaAoDominioAgendamento() {
        Cliente cliente = clienteCompleto();

        LocalDate dia = LocalDate.now(TZ_BR).plusDays(1);
        Agendamento ag = novoAgendamento(100, StatusAgendamentoEnum.AGENDADO, cliente, dia, LocalTime.of(9, 0));

        when(clienteRepository.findAll()).thenReturn(List.of(cliente));
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

        when(clienteRepository.findAll()).thenReturn(List.of(cliente));
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
                        eq(200), eq("Paciente Ana"), eq(dia), eq("14:30"), eq("5511888887777"));
        verify(agendamentoRepository, never()).save(ag);
    }

    @Test
    void texto_sim_sem_protocolo_sem_correlacao_nao_chama_servico_agendamento() {
        Cliente cliente = clienteCompleto();
        when(clienteRepository.findAll()).thenReturn(List.of(cliente));
        when(mensagemRepository.existsByTwilioMessageSid("SID-X")).thenReturn(false);

        service.processarEntradaPaciente("whatsapp:+5511888887777", "5511888887777", "sim", "SID-X", "", "", null);

        verify(mensagemRepository, never()).save(any());
        verify(agendamentoIntegracaoCliente, never()).notificarRespostaWhatsapp(anyInt(), any());
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
        Cliente c = new Cliente();
        c.setId(9);
        c.setNome("Paciente Ana");
        c.setTelefone("5511888887777");
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
