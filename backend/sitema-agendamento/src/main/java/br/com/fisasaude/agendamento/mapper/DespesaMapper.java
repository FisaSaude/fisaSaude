package br.com.fisasaude.agendamento.mapper;

import br.com.fisasaude.agendamento.dto.despesa.DespesaCreateRequestDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaResponseDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaUpdateRequestDto;
import br.com.fisasaude.agendamento.model.entity.Despesa;
import br.com.fisasaude.agendamento.model.entity.Estabelecimento;
import org.springframework.stereotype.Component;

@Component
public class DespesaMapper {
    public Despesa toEntity(DespesaCreateRequestDto dto, Estabelecimento estabelecimento) {
        return new Despesa(null, dto.nome(), dto.dataDespesa(), dto.tipo(), dto.valor(), estabelecimento);
    }

    public void updateEntity(Despesa entity, DespesaUpdateRequestDto dto, Estabelecimento estabelecimento) {
        entity.setNome(dto.nome());
        entity.setDataDespesa(dto.dataDespesa());
        entity.setTipo(dto.tipo());
        entity.setValor(dto.valor());
        entity.setEstabelecimento(estabelecimento);
    }

    public DespesaResponseDto toResponse(Despesa entity) {
        return new DespesaResponseDto(
            entity.getId(),
            entity.getNome(),
            entity.getDataDespesa(),
            entity.getTipo(),
            entity.getValor(),
            entity.getEstabelecimento() != null ? entity.getEstabelecimento().getId() : null
        );
    }
}


