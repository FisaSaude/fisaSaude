package br.com.fisasaude.agendamento.service;

import br.com.fisasaude.agendamento.dto.cliente.ClienteCreateRequestDto;
import br.com.fisasaude.agendamento.dto.cliente.ClienteResponseDto;
import br.com.fisasaude.agendamento.dto.cliente.ClienteUpdateRequestDto;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.ConflictException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.exception.UnprocessableEntityException;
import br.com.fisasaude.agendamento.mapper.ClienteMapper;
import br.com.fisasaude.agendamento.model.entity.Cliente;
import br.com.fisasaude.agendamento.repository.ClienteRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final ClienteMapper clienteMapper;

    public ClienteService(ClienteRepository clienteRepository, ClienteMapper clienteMapper) {
        this.clienteRepository = clienteRepository;
        this.clienteMapper = clienteMapper;
    }

    @Transactional
    public ClienteResponseDto criar(ClienteCreateRequestDto dto) {
        validarDto(dto);
        validarDataNascimento(dto.dataNascimento());

        if (clienteRepository.existsByTelefone(dto.telefone())) {
            throw new ConflictException("Ja existe cliente com esse numero WhatsApp");
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
            throw new ConflictException("Ja existe outro cliente com esse numero WhatsApp");
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

    @Transactional(readOnly = true)
    public List<ClienteResponseDto> listarPorUsuarioId(Integer usuarioId) {
        // Supondo que Cliente tenha um campo usuario_id ou relação com Usuario
        List<Cliente> clientes = clienteRepository.findByUsuarioId(usuarioId);
        return clientes.stream().map(clienteMapper::toResponse).toList();
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
