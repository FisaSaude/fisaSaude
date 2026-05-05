package br.com.fisasaude.notificacao.service.support;

import br.com.fisasaude.notificacao.model.enums.RespostaWhatsappTipoEnum;
import java.text.Normalizer;
import java.util.Locale;

public final class RespostaWhatsappTexto {

    private RespostaWhatsappTexto() {}

    /**
     * Conteudo recebido (Twilio etc.): apenas trim nos extremos + espacos/quebras de linha internas
     * colapsadas em um espaco, para persistencia/log alinhada ao classificado.
     */
    public static String conteudoParaPersistencia(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        return raw.trim().replaceAll("\\s+", " ");
    }

    /**
     * Classifica texto da resposta: {@code trim}, colapso de {@code \\s} (espacos, {@code \\n}, {@code \\r},
     * tabs) e comparacao case-insensitive (via maiusculas sem acento em ASCII).
     */
    public static RespostaWhatsappTipoEnum classificarRespostaPaciente(String body) {
        String t = normalizar(body);
        if (t.isBlank()) {
            return RespostaWhatsappTipoEnum.OUTRO;
        }
        // Equivale a equalsIgnoreCase("sim") quando o texto (apos trim+collapse) e apenas "sim"
        if ("SIM".equals(t)
                || t.contains("SIM")
                || t.contains("CONFIRM")
                || t.contains("CORRETO")
                || "OK".equals(t)) {
            return RespostaWhatsappTipoEnum.SIM;
        }
        if (t.contains("REMARC")) {
            return RespostaWhatsappTipoEnum.REAGENDAR;
        }
        if ("NAO".equals(t)
                || t.contains("NAO")) {
            return RespostaWhatsappTipoEnum.NAO;
        }
        return RespostaWhatsappTipoEnum.OUTRO;
    }

    private static String normalizar(String raw) {
        if (raw == null || raw.isBlank()) {
            return "";
        }
        String colapsado = raw.trim().replaceAll("\\s+", " ");
        String upper = colapsado.toUpperCase(Locale.ROOT);
        return Normalizer.normalize(upper, Normalizer.Form.NFD).replaceAll("\\p{M}+", "");
    }
}
