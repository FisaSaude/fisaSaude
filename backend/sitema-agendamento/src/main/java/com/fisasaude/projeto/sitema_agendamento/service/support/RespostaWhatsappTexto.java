package com.fisasaude.projeto.sitema_agendamento.service.support;

import com.fisasaude.projeto.sitema_agendamento.model.enums.RespostaWhatsappTipoEnum;
import java.text.Normalizer;
import java.util.Locale;

/** Heurística SIM / NÃO / remarcar usada pelo webhook inbound (texto ASCII em maiúsculas). */
public final class RespostaWhatsappTexto {

    private RespostaWhatsappTexto() {}

    /** Classifica a mensagem bruta do paciente (normalize + ASCII sem acento). */
    public static RespostaWhatsappTipoEnum classificarRespostaPaciente(String body) {
        String t = normalizar(body);
        if (t.isBlank()) {
            return RespostaWhatsappTipoEnum.OUTRO;
        }
        if (t.contains("SIM") || t.contains("CONFIRM") || t.contains("CORRETO") || "OK".equals(t)) {
            return RespostaWhatsappTipoEnum.SIM;
        }
        if (t.contains("REMARC")) {
            return RespostaWhatsappTipoEnum.REAGENDAR;
        }
        if (t.contains("NAO")) {
            return RespostaWhatsappTipoEnum.NAO;
        }
        return RespostaWhatsappTipoEnum.OUTRO;
    }

    private static String normalizar(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        String upper = raw.trim().toUpperCase(Locale.ROOT);
        return Normalizer.normalize(upper, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
    }
}
