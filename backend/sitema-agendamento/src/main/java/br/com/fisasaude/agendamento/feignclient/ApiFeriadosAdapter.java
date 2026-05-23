package br.com.fisasaude.agendamento.feignclient;

import br.com.fisasaude.agendamento.service.port.FeriadosPort;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

@Component
public class ApiFeriadosAdapter implements FeriadosPort {

    private final ApiFeriados apiFeriados;

    public ApiFeriadosAdapter(ApiFeriados apiFeriados) {
        this.apiFeriados = apiFeriados;
    }

    @Override
    public Set<LocalDate> buscarFeriados(int ano) {
        List<FeriadoDto> feriadosDto = apiFeriados.listarFeriados(ano);
        return feriadosDto.stream()
                .map(FeriadoDto::date)
                .collect(Collectors.toSet());
    }
}

