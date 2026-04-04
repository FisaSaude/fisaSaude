package com.fisasaude.projeto.sitema_agendamento.mapper;

import com.fisasaude.projeto.sitema_agendamento.dto.cliente.ClienteCreateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.dto.cliente.ClienteResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.cliente.ClienteUpdateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.model.Cliente;
import org.springframework.stereotype.Component;

@Component
public class ClienteMapper {

    public Cliente toEntity(ClienteCreateRequestDto dto) {
        Cliente cliente = new Cliente();
        cliente.setNome(dto.nome());
        cliente.setTelefone(dto.telefone());
        cliente.setDataNascimento(dto.dataNascimento());
        cliente.setSexo(dto.sexo());
        cliente.setFotoLink(dto.fotoLink());
        return cliente;
    }

    public void updateEntity(Cliente cliente, ClienteUpdateRequestDto dto) {
        cliente.setNome(dto.nome());
        cliente.setTelefone(dto.telefone());
        cliente.setDataNascimento(dto.dataNascimento());
        cliente.setSexo(dto.sexo());
        cliente.setFotoLink(dto.fotoLink());
    }

    public ClienteResponseDto toResponse(Cliente cliente) {
        return new ClienteResponseDto(
                cliente.getId(),
                cliente.getNome(),
                cliente.getTelefone(),
                cliente.getDataNascimento(),
                cliente.getSexo(),
                cliente.getFotoLink()
        );
    }
}
