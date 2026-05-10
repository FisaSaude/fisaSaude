package br.com.fisasaude.agendamento.mapper;

import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioCreateRequestDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioResponseDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioUpdateRequestDto;
import br.com.fisasaude.agendamento.model.entity.Prontuario;
import br.com.fisasaude.agendamento.model.entity.Cliente;
import org.springframework.stereotype.Component;

@Component
public class ProntuarioMapper {
    public Prontuario toEntity(ProntuarioCreateRequestDto dto, Cliente cliente) {
        return new Prontuario(null, dto.observacoes(), dto.criadoEm(), cliente);
    }

    public void updateEntity(Prontuario prontuario, ProntuarioUpdateRequestDto dto) {
        prontuario.setObservacoes(dto.observacoes());
    }

    public ProntuarioResponseDto toResponse(Prontuario prontuario) {
        return new ProntuarioResponseDto(
            prontuario.getId(),
            prontuario.getObservacoes(),
            prontuario.getCriadoEm(),
            prontuario.getCliente() != null ? prontuario.getCliente().getId() : null
        );
    }
}

