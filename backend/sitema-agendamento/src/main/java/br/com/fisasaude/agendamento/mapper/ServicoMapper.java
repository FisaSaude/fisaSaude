package br.com.fisasaude.agendamento.mapper;

import br.com.fisasaude.agendamento.dto.servico.ServicoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.servico.ServicoResponseDto;
import br.com.fisasaude.agendamento.dto.servico.ServicoUpdateRequestDto;
import br.com.fisasaude.agendamento.model.entity.Servico;
import org.springframework.stereotype.Component;

@Component
public class ServicoMapper {

    public Servico toEntity(ServicoCreateRequestDto dto) {
        Servico servico = new Servico();
        servico.setNome(dto.nome());
        servico.setTipo(dto.tipo());
        servico.setPreco(dto.preco());
        servico.setDuracaoMinutos(dto.duracaoMinutos());
        servico.setAtivo(dto.ativo());
        return servico;
    }

    public void updateEntity(Servico servico, ServicoUpdateRequestDto dto) {
        servico.setNome(dto.nome());
        servico.setTipo(dto.tipo());
        servico.setPreco(dto.preco());
        servico.setDuracaoMinutos(dto.duracaoMinutos());
        servico.setAtivo(dto.ativo());
    }

    public ServicoResponseDto toResponse(Servico servico) {
        return new ServicoResponseDto(
                servico.getId(),
                servico.getNome(),
                servico.getTipo(),
                servico.getPreco(),
                servico.getDuracaoMinutos(),
                servico.getAtivo()
        );
    }
}
