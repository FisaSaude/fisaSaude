package br.com.fisasaude.notificacao.service;

import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import br.com.fisasaude.notificacao.dto.LembreteDisparoResponseDto;
import br.com.fisasaude.notificacao.integration.agendamento.AgendamentoIntegracaoCliente;
import br.com.fisasaude.notificacao.integration.agendamento.AgendamentoLembreteDto;
import br.com.fisasaude.notificacao.integration.twilio.TwilioWhatsappSender;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class LembreteDiaAnteriorService {

    private static final Logger log = LoggerFactory.getLogger(LembreteDiaAnteriorService.class);
    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm");

    private final AgendamentoIntegracaoCliente agendamentoIntegracaoCliente;
    private final TwilioWhatsappSender twilioWhatsappSender;
    private final NotificacaoAppProperties props;

    public LembreteDiaAnteriorService(
            AgendamentoIntegracaoCliente agendamentoIntegracaoCliente,
            TwilioWhatsappSender twilioWhatsappSender,
            NotificacaoAppProperties props) {
        this.agendamentoIntegracaoCliente = agendamentoIntegracaoCliente;
        this.twilioWhatsappSender = twilioWhatsappSender;
        this.props = props;
    }

    /**
     * Dispara lembretes WhatsApp para agendamentos confirmados na {@code dataAtendimento}
     * (regra D-1: em produção o scheduler chama com {@code hoje + 1 dia} às 15h).
     */
    public LembreteDisparoResponseDto dispararLembretesParaData(LocalDate dataAtendimento) {
        if (dataAtendimento == null) {
            throw new IllegalArgumentException("dataAtendimento é obrigatória");
        }
        List<AgendamentoLembreteDto> confirmados =
                agendamentoIntegracaoCliente.buscarConfirmadosParaLembrete(dataAtendimento);
        int enviados = 0;
        int falhas = 0;
        List<Integer> idsEnviados = new ArrayList<>();
        for (AgendamentoLembreteDto agendamento : confirmados) {
            String msg = "⏰ Lembrete:\nSeu atendimento é amanhã às "
                    + agendamento.horaInicio().format(HORA_FMT)
                    + ".\nNos vemos lá 👍";
            try {
                twilioWhatsappSender.enviarTextoParaWhatsapp(agendamento.telefoneCliente(), msg);
                enviados++;
                idsEnviados.add(agendamento.agendamentoId());
            } catch (Exception e) {
                falhas++;
                log.warn(
                        "Falha envio lembrete agendamentoId={} telefone={} erro={}",
                        agendamento.agendamentoId(),
                        agendamento.telefoneCliente(),
                        e.toString());
            }
        }
        return new LembreteDisparoResponseDto(
                dataAtendimento, confirmados.size(), enviados, falhas, idsEnviados);
    }

    public LocalDate dataPadraoDiaSeguinte() {
        return LocalDate.now(ZoneId.of(props.getTimezone())).plusDays(1);
    }
}
