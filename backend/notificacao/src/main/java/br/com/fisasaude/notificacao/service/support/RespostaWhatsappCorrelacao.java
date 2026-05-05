package br.com.fisasaude.notificacao.service.support;

import br.com.fisasaude.notificacao.model.entity.Notificacao;
import br.com.fisasaude.notificacao.model.enums.RespostaWhatsappTipoEnum;
import br.com.fisasaude.notificacao.repository.NotificacaoRepository;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Correlacao deterministica entre resposta WhatsApp (Twilio) e agendamento.
 * Prioridade: {@code ButtonPayload} → mesmo padrao no {@code Body} → {@code SIM|NAO + id}
 * → mensagem anterior ({@code OriginalRepliedMessageSid} + classificacao do texto).
 */
public final class RespostaWhatsappCorrelacao {

    private static final Pattern CONFIRMAR = Pattern.compile("(?is)^\\s*CONFIRMAR[_\\s-]?(\\d+)\\s*$");
    private static final Pattern CANCELAR = Pattern.compile("(?is)^\\s*CANCELAR[_\\s-]?(\\d+)\\s*$");
    private static final Pattern SIM_ID =
            Pattern.compile("(?ius)^SIM\\D*(\\d+)\\s*$");
    private static final Pattern NAO_ID = Pattern.compile("(?ius)^(NAO|NÃO)\\D*(\\d+)\\s*$");

    private RespostaWhatsappCorrelacao() {}

    /** Origem usada apenas para auditoria/logs. */
    public enum OrigemCorrelacao {
        BUTTON_PAYLOAD,
        BODY_BOTAO_SIMULADO,
        BODY_SIM_NAO_SIMPLES,
        BODY_SIM_NAO_ID,
        MENSAGEM_ANTERIOR_SID
    }

    public record Resultado(
            Integer agendamentoId, RespostaWhatsappTipoEnum tipo, OrigemCorrelacao origem, String textoAnalisado) {}

    public static Optional<Resultado> resolver(
            String buttonPayload,
            String body,
            String originalRepliedMessageSid,
            NotificacaoRepository notificacaoRepository) {

        String payload = normalized(buttonPayload);
        String texto = normalized(body);

        Optional<Resultado> porPayload = tentarConfirmarCancelar(payload, OrigemCorrelacao.BUTTON_PAYLOAD);
        if (porPayload.isPresent()) {
            return porPayload;
        }
        Optional<Resultado> porBodyBotao = tentarConfirmarCancelar(texto, OrigemCorrelacao.BODY_BOTAO_SIMULADO);
        if (porBodyBotao.isPresent()) {
            return porBodyBotao;
        }

        Optional<Resultado> porSimNaoId = tentarSimNaoComId(texto);
        if (porSimNaoId.isPresent()) {
            return porSimNaoId;
        }

        if (originalRepliedMessageSid != null && !originalRepliedMessageSid.isBlank()) {
            Optional<Notificacao> notif =
                    notificacaoRepository.findByTwilioMessageSidWithAgendamento(originalRepliedMessageSid.trim());
            if (notif.isEmpty()) {
                return Optional.empty();
            }
            Integer agId = notif.get().getAgendamento().getId();
            RespostaWhatsappTipoEnum tipoCorpo = RespostaWhatsappTexto.classificarRespostaPaciente(body);
            if (tipoCorpo != RespostaWhatsappTipoEnum.SIM && tipoCorpo != RespostaWhatsappTipoEnum.NAO) {
                return Optional.empty();
            }
            return Optional.of(
                    new Resultado(
                            agId,
                            tipoCorpo,
                            OrigemCorrelacao.MENSAGEM_ANTERIOR_SID,
                            RespostaWhatsappTexto.conteudoParaPersistencia(body)));
        }
        return Optional.empty();
    }

    private static Optional<Resultado> tentarConfirmarCancelar(String texto, OrigemCorrelacao origem) {
        if (texto.isBlank()) {
            return Optional.empty();
        }
        Matcher mConfirmar = CONFIRMAR.matcher(texto);
        if (mConfirmar.matches()) {
            return Optional.of(
                    new Resultado(
                            Integer.valueOf(mConfirmar.group(1)),
                            RespostaWhatsappTipoEnum.SIM,
                            origem,
                            texto));
        }
        Matcher mCancelar = CANCELAR.matcher(texto);
        if (mCancelar.matches()) {
            return Optional.of(
                    new Resultado(
                            Integer.valueOf(mCancelar.group(1)),
                            RespostaWhatsappTipoEnum.NAO,
                            origem,
                            texto));
        }
        return Optional.empty();
    }

    private static Optional<Resultado> tentarSimNaoComId(String texto) {
        if (texto.isBlank()) {
            return Optional.empty();
        }
        Matcher mSim = SIM_ID.matcher(texto);
        if (mSim.matches()) {
            return Optional.of(
                    new Resultado(
                            Integer.valueOf(mSim.group(1)),
                            RespostaWhatsappTipoEnum.SIM,
                            OrigemCorrelacao.BODY_SIM_NAO_ID,
                            texto));
        }
        Matcher mNao = NAO_ID.matcher(texto);
        if (mNao.matches()) {
            return Optional.of(
                    new Resultado(
                            Integer.valueOf(mNao.group(2)),
                            RespostaWhatsappTipoEnum.NAO,
                            OrigemCorrelacao.BODY_SIM_NAO_ID,
                            texto));
        }
        return Optional.empty();
    }

    public static boolean contemIdNoTexto(String texto) {
        String t = normalized(texto);
        if (t.isBlank()) {
            return false;
        }
        return SIM_ID.matcher(t).matches() || NAO_ID.matcher(t).matches();
    }

    private static String normalized(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        return raw.trim().replaceAll("\\s+", " ");
    }
}
