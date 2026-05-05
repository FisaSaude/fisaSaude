package br.com.fisasaude.notificacao.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notifications")
public class NotificacaoAppProperties {

    private boolean twilioEnabled = false;

    private String timezone = "America/Sao_Paulo";
    private String lembreteCron = "0 0 15 * * ?";

    private long retryFixedRateMs = 3_600_000L;

    private int maxSendAttempts = 3;

    private String accountSid = "";
    private String authToken = "";
    private String whatsappFrom = "";

    private final Whatsapp whatsapp = new Whatsapp();

    /** Content Template Builder SID (opcional): quick replies CONFIRMAR_{id} / CANCELAR_{id} correspondem aos placeholders enviados. */
    private String confirmacaoWhatsappContentSid = "";

    /** Messaging Service SID (opcional; recomendado ao usar Content API). Se vazio, usa whatsapp-from. */
    private String confirmacaoWhatsappMessagingServiceSid = "";

    private String establishmentAlertTo = "";

    public boolean isTwilioEnabled() {
        return twilioEnabled;
    }

    public void setTwilioEnabled(boolean twilioEnabled) {
        this.twilioEnabled = twilioEnabled;
    }

    public String getTimezone() {
        return timezone;
    }

    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }

    public String getLembreteCron() {
        return lembreteCron;
    }

    public void setLembreteCron(String lembreteCron) {
        this.lembreteCron = lembreteCron;
    }

    public long getRetryFixedRateMs() {
        return retryFixedRateMs;
    }

    public void setRetryFixedRateMs(long retryFixedRateMs) {
        this.retryFixedRateMs = retryFixedRateMs;
    }

    public int getMaxSendAttempts() {
        return maxSendAttempts;
    }

    public void setMaxSendAttempts(int maxSendAttempts) {
        this.maxSendAttempts = maxSendAttempts;
    }

    public String getAccountSid() {
        return accountSid;
    }

    public void setAccountSid(String accountSid) {
        this.accountSid = accountSid;
    }

    public String getAuthToken() {
        return authToken;
    }

    public void setAuthToken(String authToken) {
        this.authToken = authToken;
    }

    public String getWhatsappFrom() {
        return whatsappFrom;
    }

    public void setWhatsappFrom(String whatsappFrom) {
        this.whatsappFrom = whatsappFrom;
    }

    public Whatsapp getWhatsapp() {
        return whatsapp;
    }

    public String getConfirmacaoWhatsappContentSid() {
        return confirmacaoWhatsappContentSid != null ? confirmacaoWhatsappContentSid : "";
    }

    public void setConfirmacaoWhatsappContentSid(String confirmacaoWhatsappContentSid) {
        this.confirmacaoWhatsappContentSid = confirmacaoWhatsappContentSid;
    }

    public String getConfirmacaoWhatsappMessagingServiceSid() {
        return confirmacaoWhatsappMessagingServiceSid != null ? confirmacaoWhatsappMessagingServiceSid : "";
    }

    public void setConfirmacaoWhatsappMessagingServiceSid(String confirmacaoWhatsappMessagingServiceSid) {
        this.confirmacaoWhatsappMessagingServiceSid = confirmacaoWhatsappMessagingServiceSid;
    }

    public String getEstablishmentAlertTo() {
        return establishmentAlertTo;
    }

    public void setEstablishmentAlertTo(String establishmentAlertTo) {
        this.establishmentAlertTo = establishmentAlertTo;
    }

    public static class Whatsapp {
        private boolean usarTemplate = false;
        private String contentSid = "";

        public boolean isUsarTemplate() {
            return usarTemplate;
        }

        public void setUsarTemplate(boolean usarTemplate) {
            this.usarTemplate = usarTemplate;
        }

        public String getContentSid() {
            return contentSid != null ? contentSid : "";
        }

        public void setContentSid(String contentSid) {
            this.contentSid = contentSid;
        }
    }
}
