package com.fisasaude.projeto.sitema_agendamento.service;

import com.fisasaude.projeto.sitema_agendamento.dto.ClienteCreateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.dto.ClienteResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.ClienteUpdateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.exception.BadRequestException;
import com.fisasaude.projeto.sitema_agendamento.exception.ConflictException;
import com.fisasaude.projeto.sitema_agendamento.exception.NotFoundException;
import com.fisasaude.projeto.sitema_agendamento.exception.UnprocessableEntityException;
import com.fisasaude.projeto.sitema_agendamento.mapper.ClienteMapper;
import com.fisasaude.projeto.sitema_agendamento.model.Cliente;
import com.fisasaude.projeto.sitema_agendamento.repository.ClienteRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    @Transactional
    public ClienteResponseDto criar(ClienteCreateRequestDto dto) {
        validarDto(dto);
        validarDataNascimento(dto.dataNascimento());

        if (clienteRepository.existsByTelefone(dto.telefone())) {
            throw new ConflictException("Ja existe cliente com o telefone informado");
        }

        Cliente cliente = clienteMapper.toEntity(dto);
        Cliente salvo = clienteRepository.save(cliente);
        return clienteMapper.toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<ClienteResponseDto> listarTodos() {
        return clienteRepository.findAll().stream()
                .map(clienteMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ClienteResponseDto buscarPorId(Integer id) {
        validarId(id);

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado"));

        return clienteMapper.toResponse(cliente);
    }

    @Transactional
    public ClienteResponseDto atualizar(Integer id, ClienteUpdateRequestDto dto) {
        validarId(id);
        validarDto(dto);
        validarDataNascimento(dto.dataNascimento());

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado"));

        if (clienteRepository.existsByTelefoneAndIdNot(dto.telefone(), id)) {
            throw new ConflictException("Ja existe outro cliente com o telefone informado");
        }

        clienteMapper.updateEntity(cliente, dto);
        Cliente atualizado = clienteRepository.save(cliente);
        return clienteMapper.toResponse(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        validarId(id);

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Cliente nao encontrado"));

        clienteRepository.delete(cliente);
    }

    private void validarId(Integer id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Id invalido");
        }
    }

    private void validarDataNascimento(LocalDate dataNascimento) {
        if (dataNascimento == null) {
            throw new BadRequestException("dataNascimento e obrigatoria");
        }

        if (dataNascimento.isAfter(LocalDate.now())) {
            throw new UnprocessableEntityException("dataNascimento nao pode ser futura");
        }
    }

    private void validarDto(Object dto) {
        if (dto == null) {
            throw new BadRequestException("Corpo da requisicao nao pode ser nulo");
        }
    }
}
