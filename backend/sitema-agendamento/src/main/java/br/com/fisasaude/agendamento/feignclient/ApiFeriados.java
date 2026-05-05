package br.com.fisasaude.agendamento.feignclient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "apiFeriados", url = "${api.feriados.url}")
public interface ApiFeriados {

    @GetMapping("/{ano}")
    List<FeriadoDto> listarFeriados(@PathVariable Integer ano);
}
