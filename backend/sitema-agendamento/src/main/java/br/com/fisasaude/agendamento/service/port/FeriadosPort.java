package br.com.fisasaude.agendamento.service.port;

import java.time.LocalDate;
import java.util.Set;

public interface FeriadosPort {

    Set<LocalDate> buscarFeriados(int ano);
}

