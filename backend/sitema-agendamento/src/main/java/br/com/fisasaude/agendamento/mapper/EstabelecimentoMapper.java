package br.com.fisasaude.agendamento.mapper;

import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoResponseDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoUpdateRequestDto;
import br.com.fisasaude.agendamento.model.entity.Estabelecimento;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class EstabelecimentoMapper {

    public Estabelecimento toEntity(EstabelecimentoCreateRequestDto dto) {
        Estabelecimento e = new Estabelecimento();
        e.setNome(dto.nome());
        e.setEndereco(dto.endereco());
        e.setParametros(dto.parametros());
        e.setInicioFuncionamento(dto.inicioFuncionamento());
        e.setFimFuncionamento(dto.fimFuncionamento());
        e.setTelefone(dto.telefone());
        e.setCriadoEm(LocalDateTime.now());
        return e;
    }

    public void updateEntity(Estabelecimento e, EstabelecimentoUpdateRequestDto dto) {
        e.setNome(dto.nome());
        e.setEndereco(dto.endereco());
        e.setParametros(dto.parametros());
        e.setInicioFuncionamento(dto.inicioFuncionamento());
        e.setFimFuncionamento(dto.fimFuncionamento());
        e.setTelefone(dto.telefone());
    }

    public EstabelecimentoResponseDto toResponse(Estabelecimento e) {
        return new EstabelecimentoResponseDto(
                e.getId(),
                e.getNome(),
                e.getEndereco(),
                e.getParametros(),
                e.getInicioFuncionamento(),
                e.getFimFuncionamento(),
                e.getTelefone(),
                e.getCriadoEm()
        );
    }
}

