package com.fisasaude.projeto.sitema_agendamento.model.entity;

import com.fisasaude.projeto.sitema_agendamento.model.enums.StatusNotificacaoEnum;
import com.fisasaude.projeto.sitema_agendamento.model.enums.TipoNotificacaoEnum;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidade que representa uma notificação enviada ao cliente.
 * Uma notificação está associada a um agendamento.
 */
@Entity
@Table(name = "notificacao")
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoNotificacaoEnum tipo;

    @Column(nullable = false, name = "status")
    @Enumerated(EnumType.STRING)
    private StatusNotificacaoEnum status;

    @Column(name = "twilio_message_sid", unique = true, length = 100)
    private String twilioMessageSid;

    @Column(nullable = false)
    private Integer tentativas = 0;

    @Column(columnDefinition = "TEXT")
    private String mensagem;

    @Column(name = "proxima_retentativa")
    private LocalDateTime proximaRetentativa;

    @Column(name = "enviado_em")
    private LocalDateTime enviadoEm;

    @Column(nullable = false, name = "criado_em")
    private LocalDateTime criadoEm;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agendamento_id", nullable = false)
    private Agendamento agendamento;

    public Notificacao() {}

    public Notificacao(
            Integer id,
            TipoNotificacaoEnum tipo,
            StatusNotificacaoEnum status,
            String twilioMessageSid,
            Integer tentativas,
            String mensagem,
            LocalDateTime proximaRetentativa,
            LocalDateTime enviadoEm,
            LocalDateTime criadoEm,
            Agendamento agendamento
    ) {
        this.id = id;
        this.tipo = tipo;
        this.status = status;
        this.twilioMessageSid = twilioMessageSid;
        this.tentativas = tentativas != null ? tentativas : 0;
        this.mensagem = mensagem;
        this.proximaRetentativa = proximaRetentativa;
        this.enviadoEm = enviadoEm;
        this.criadoEm = criadoEm != null ? criadoEm : LocalDateTime.now();
        this.agendamento = agendamento;
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public TipoNotificacaoEnum getTipo() { return tipo; }
    public void setTipo(TipoNotificacaoEnum tipo) { this.tipo = tipo; }

    public StatusNotificacaoEnum getStatus() { return status; }
    public void setStatus(StatusNotificacaoEnum status) { this.status = status; }

    public String getTwilioMessageSid() { return twilioMessageSid; }
    public void setTwilioMessageSid(String twilioMessageSid) { this.twilioMessageSid = twilioMessageSid; }

    public Integer getTentativas() { return tentativas; }
    public void setTentativas(Integer tentativas) {
        this.tentativas = tentativas != null ? tentativas : 0;
    }

    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }

    public LocalDateTime getProximaRetentativa() { return proximaRetentativa; }
    public void setProximaRetentativa(LocalDateTime proximaRetentativa) { this.proximaRetentativa = proximaRetentativa; }

    public LocalDateTime getEnviadoEm() { return enviadoEm; }
    public void setEnviadoEm(LocalDateTime enviadoEm) { this.enviadoEm = enviadoEm; }

    public LocalDateTime getCriadoEm() { return criadoEm; }
    public void setCriadoEm(LocalDateTime criadoEm) { this.criadoEm = criadoEm; }

    public Agendamento getAgendamento() { return agendamento; }
    public void setAgendamento(Agendamento agendamento) { this.agendamento = agendamento; }

    @PrePersist
    void prePersist() {
        if (tentativas == null) {
            tentativas = 0;
        }
        if (criadoEm == null) {
            criadoEm = LocalDateTime.now();
        }
    }

    @Override
    public String toString() {
        return "Notificacao{" +
                "id=" + id +
                ", tipo=" + tipo +
                ", status=" + status +
                ", twilioMessageSid='" + twilioMessageSid + '\'' +
                ", tentativas=" + tentativas +
                ", proximaRetentativa=" + proximaRetentativa +
                ", enviadoEm=" + enviadoEm +
                ", criadoEm=" + criadoEm +
                ", agendamento=" + (agendamento != null ? agendamento.getId() : null) +
                '}';
    }
}
