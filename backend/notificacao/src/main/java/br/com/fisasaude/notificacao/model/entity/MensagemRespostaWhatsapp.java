package br.com.fisasaude.notificacao.model.entity;

import br.com.fisasaude.notificacao.model.enums.RespostaWhatsappTipoEnum;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensagem_resposta_whatsapp")
public class MensagemRespostaWhatsapp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "agendamento_id", nullable = false)
    private Agendamento agendamento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @Column(nullable = false, length = 20)
    private String telefone;

    @Column(name = "conteudo_resposta", nullable = false, columnDefinition = "TEXT")
    private String conteudoResposta;

    @Enumerated(EnumType.STRING)
    @Column(name = "resposta_tipo", nullable = false)
    private RespostaWhatsappTipoEnum respostaTipo = RespostaWhatsappTipoEnum.OUTRO;

    @Column(name = "twilio_message_sid", length = 100)
    private String twilioMessageSid;

    @Column(name = "data_recebida", nullable = false)
    private LocalDateTime dataRecebida;

    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    void prePersist() {
        LocalDateTime agora = LocalDateTime.now();
        if (dataRecebida == null) {
            dataRecebida = agora;
        }
        if (criadoEm == null) {
            criadoEm = agora;
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Agendamento getAgendamento() {
        return agendamento;
    }

    public void setAgendamento(Agendamento agendamento) {
        this.agendamento = agendamento;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getConteudoResposta() {
        return conteudoResposta;
    }

    public void setConteudoResposta(String conteudoResposta) {
        this.conteudoResposta = conteudoResposta;
    }

    public RespostaWhatsappTipoEnum getRespostaTipo() {
        return respostaTipo;
    }

    public void setRespostaTipo(RespostaWhatsappTipoEnum respostaTipo) {
        this.respostaTipo = respostaTipo;
    }

    public String getTwilioMessageSid() {
        return twilioMessageSid;
    }

    public void setTwilioMessageSid(String twilioMessageSid) {
        this.twilioMessageSid = twilioMessageSid;
    }

    public LocalDateTime getDataRecebida() {
        return dataRecebida;
    }

    public void setDataRecebida(LocalDateTime dataRecebida) {
        this.dataRecebida = dataRecebida;
    }

    public LocalDateTime getCriadoEm() {
        return criadoEm;
    }

    public void setCriadoEm(LocalDateTime criadoEm) {
        this.criadoEm = criadoEm;
    }
}
