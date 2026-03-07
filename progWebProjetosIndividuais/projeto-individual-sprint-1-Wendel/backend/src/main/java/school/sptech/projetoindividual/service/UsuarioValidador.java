package school.sptech.projetoindividual.service;

import org.springframework.stereotype.Component;
import school.sptech.projetoindividual.model.dto.UsuarioRequestDTO;

import java.time.LocalDate;
import java.util.List;

@Component
public class UsuarioValidador {
    public void validarCriacao(UsuarioRequestDTO dto) {

        if (dto == null)
            throw new IllegalArgumentException("Body obrigatório");

        if (isBlank(dto.getNome()))
            throw new IllegalArgumentException("Nome obrigatório");

        if (isBlank(dto.getEmail()))
            throw new IllegalArgumentException("Email obrigatório");

        if (dto.getDtNascimento() == null || dto.getDtNascimento().toLocalDate().isAfter(LocalDate.now()))
            throw new IllegalArgumentException("Data nascimento obrigatória");

        if (dto.getTipoFavoritoId() == null)
            throw new IllegalArgumentException("Tipo favorito obrigatório");

        validarFrequencia(dto.getFrequenciaRecebimento());
    }

    private void validarFrequencia(String frequencia) {

        if (!List.of("diaria","semanal","mensal").contains(frequencia)) {
            throw new IllegalArgumentException("Frequência inválida");
        }
    }

    private boolean isBlank(String valor) {
        return valor == null || valor.isBlank();
    }
}
