package br.com.fisasaude.notificacao.integration.twilio;

import br.com.fisasaude.notificacao.config.NotificacaoAppProperties;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.rest.api.v2010.account.MessageCreator;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class TwilioWhatsappSender {

    private static final Logger log = LoggerFactory.getLogger(TwilioWhatsappSender.class);

    private final NotificacaoAppProperties props;
    private volatile boolean initialized;

    public TwilioWhatsappSender(NotificacaoAppProperties props) {
        this.props = props;
    }

    public String enviarTextoParaWhatsapp(String destinoE164OuWhatsapp, String corpo)
            throws com.twilio.exception.TwilioException {
        if (!props.isTwilioEnabled()) {
            log.warn(
                    "Twilio desabilitado (app.notifications.twilio-enabled=false): mensagem seria para {} — preview: {}",
                    destinoE164OuWhatsapp,
                    shorten(corpo, 120));
            return "DISABLED_PREVIEW";
        }
        initClientIfNeeded();
        String para = garantirPrefixoWhatsapp(destinoE164OuWhatsapp);
        String de = garantirPrefixoWhatsapp(props.getWhatsappFrom());
        Message mensagem =
                Message.creator(new PhoneNumber(para), new PhoneNumber(de), corpo.trim()).create();
        log.info("Twilio Message enviado sid={} para={}", mensagem.getSid(), para);
        return mensagem.getSid();
    }

    /**
     * Envia confirmação: Content Template (quick reply, session) quando {@code contentSid} preenchido;
     * caso contrário usa corpo texto.
     *
     * <p>Variáveis JSON esperadas pelo template devem estar alinhadas com a ordem configurada na Twilio —
     * valores padrão enviados: 1 nome, 2 serviço, 3 data dd/MM/uuuu, 4 hora HH:mm, 5 id numérico, 6
     * CONFIRMAR_{id}, 7 CANCELAR_{id}.
     */
    public String enviarConfirmacaoAgendamento(
            String destinoE164OuWhatsapp,
            boolean usarTemplate,
            String contentSid,
            String messagingServiceSid,
            String contentVariablesJson,
            String corpoFallback)
            throws com.twilio.exception.TwilioException {
        if (!props.isTwilioEnabled()) {
            log.warn(
                    "Twilio desabilitado — confirmação seria para {} (content ou texto). Preview: {}",
                    destinoE164OuWhatsapp,
                    shorten(contentSid != null && !contentSid.isBlank()
                            ? "contentSid+" + shorten(contentSid, 20)
                            : corpoFallback, 140));
            return "DISABLED_PREVIEW";
        }
        initClientIfNeeded();
        String para = garantirPrefixoWhatsapp(destinoE164OuWhatsapp);

        if (!usarTemplate || contentSid == null || contentSid.isBlank()) {
            return enviarTextoParaWhatsapp(destinoE164OuWhatsapp, corpoFallback);
        }

        MessageCreator criador;
        if (messagingServiceSid != null && !messagingServiceSid.isBlank()) {
            criador = Message.creator(new PhoneNumber(para), messagingServiceSid.trim(), contentSid.trim());
            log.debug("Twilio Content via MessagingService sid={}", messagingServiceSid.trim());
        } else {
            String de = garantirPrefixoWhatsapp(props.getWhatsappFrom());
            criador = Message.creator(new PhoneNumber(para), new PhoneNumber(de), contentSid.trim());
            log.debug("Twilio Content via From={}", primeiraParteNumero(props.getWhatsappFrom()));
        }
        String vars =
                (contentVariablesJson == null || contentVariablesJson.isBlank()) ? "{}" : contentVariablesJson.trim();
        Message mensagem = criador.setContentVariables(vars).create();
        log.info("Twilio Content enviado sid={} para={} contentSid={}", mensagem.getSid(), para, contentSid.trim());
        return mensagem.getSid();
    }

    private synchronized void initClientIfNeeded() {
        if (initialized) {
            return;
        }
        Twilio.init(props.getAccountSid(), props.getAuthToken());
        initialized = true;
        log.info("Cliente Twilio inicializado (sid prefixo {}).", primeiraParteSid(props.getAccountSid()));
    }

    /**
     * Formato Twilio WhatsApp ({@code whatsapp:+DDI...}), alinhado a {@code whatsapp:+} + apenas dígitos.
     * Aceita entrada com ou sem prefixo {@code whatsapp:}, com ou sem {@code +}.
     */
    static String garantirPrefixoWhatsapp(String numeroOuWhatsapp) {
        if (numeroOuWhatsapp == null || numeroOuWhatsapp.isBlank()) {
            throw new IllegalArgumentException("numero vazio");
        }
        String t = numeroOuWhatsapp.trim();
        if (t.regionMatches(true, 0, "whatsapp:", 0, 9)) {
            t = t.substring("whatsapp:".length()).trim();
        }
        String digitos = t.replace("+", "").replaceAll("\\D+", "");
        if (digitos.isEmpty()) {
            throw new IllegalArgumentException("numero sem digitos validos");
        }
        return "whatsapp:+" + normalizarCelularBrasileiroSemDdi(digitos);
    }

    /**
     * Celular BR sem DDI (11 dígitos, 3º = 9) vira {@code 55...}. Sem isso a Twilio
     * interpreta {@code +11965643020} como EUA ({@code +1}) e responde 21211.
     * Números já com 55 e o sandbox EUA ({@code 1} + 10 dígitos) ficam iguais.
     */
    static String normalizarCelularBrasileiroSemDdi(String digitos) {
        if (digitos.startsWith("55") && digitos.length() >= 12) {
            return digitos;
        }
        if (digitos.length() == 11 && digitos.charAt(2) == '9') {
            return "55" + digitos;
        }
        return digitos;
    }

    private static String primeiraParteSid(String sid) {
        if (sid == null || sid.length() < 6) {
            return "???";
        }
        return sid.substring(0, 4) + "...";
    }

    private static String primeiraParteNumero(String n) {
        if (n == null || n.isBlank()) {
            return "???";
        }
        String d = n.replaceAll("\\D+", "");
        return d.length() <= 6 ? d : d.substring(0, 6) + "...";
    }

    private static String shorten(String s, int max) {
        if (s == null) {
            return "";
        }
        return s.length() <= max ? s : s.substring(0, max) + "...";
    }
}
