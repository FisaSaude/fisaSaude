package com.fisasaude.projeto.sitema_agendamento.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.notifications")
public class NotificacaoAppProperties {

    /**
     * Quando false, nenhuma chamada HTTP e realizada ao Twilio; apenas log.
     */
    private boolean twilioEnabled = false;

    private String timezone = "America/Sao_Paulo";
    /** Cron Spring 6-arg: lembrete do dia seguinte neste fuso */
    private String lembreteCron = "0 0 15 * * ?";

    /** Intervalo para reprocessar PENDENTE/FALHOU elegiveis (ms). Default 1h. */
    private long retryFixedRateMs = 3_600_000L;

    /** Tentativas de envio antes de DESCARTADA (primeira inclusa). Max 3 => ate 3 falhas gravadas em tentativas. */
    private int maxSendAttempts = 3;

    private String accountSid = "";
    private String authToken = "";
    /** numero Twilio formato E.164, ex whatsapp:+14155238886 */
    private String whatsappFrom = "";

    /** Destino texto simples quando paciente envia negativa (atendente). E.164 com prefixo opcional whatsapp:. */
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

    public String getEstablishmentAlertTo() {
        return establishmentAlertTo;
    }

    public void setEstablishmentAlertTo(String establishmentAlertTo) {
        this.establishmentAlertTo = establishmentAlertTo;
    }
}
