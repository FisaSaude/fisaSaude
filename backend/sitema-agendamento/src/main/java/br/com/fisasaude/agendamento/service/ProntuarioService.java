package br.com.fisasaude.agendamento.service;

import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioCreateRequestDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioResponseDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioUpdateRequestDto;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.mapper.ProntuarioMapper;
import br.com.fisasaude.agendamento.model.entity.Prontuario;
import br.com.fisasaude.agendamento.model.entity.Cliente;
import br.com.fisasaude.agendamento.repository.ProntuarioRepository;
import br.com.fisasaude.agendamento.repository.ClienteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProntuarioService {
    private final ProntuarioRepository prontuarioRepository;
    private final ClienteRepository clienteRepository;
    private final ProntuarioMapper prontuarioMapper;

    public ProntuarioService(ProntuarioRepository prontuarioRepository, ClienteRepository clienteRepository, ProntuarioMapper prontuarioMapper) {
        this.prontuarioRepository = prontuarioRepository;
        this.clienteRepository = clienteRepository;
        this.prontuarioMapper = prontuarioMapper;
    }

    @Transactional
    public ProntuarioResponseDto criar(ProntuarioCreateRequestDto dto) {
        Cliente cliente = clienteRepository.findById(dto.clienteId())
            .orElseThrow(() -> new NotFoundException("Cliente não encontrado"));
        Prontuario prontuario = prontuarioMapper.toEntity(dto, cliente);
        Prontuario salvo = prontuarioRepository.save(prontuario);
        return prontuarioMapper.toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<ProntuarioResponseDto> listarTodos() {
        return prontuarioRepository.findAll().stream()
            .map(prontuarioMapper::toResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ProntuarioResponseDto buscarPorId(Integer id) {
        Prontuario prontuario = prontuarioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Prontuário não encontrado"));
        return prontuarioMapper.toResponse(prontuario);
    }

    @Transactional
    public ProntuarioResponseDto atualizar(Integer id, ProntuarioUpdateRequestDto dto) {
        Prontuario prontuario = prontuarioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Prontuário não encontrado"));
        prontuarioMapper.updateEntity(prontuario, dto);
        Prontuario atualizado = prontuarioRepository.save(prontuario);
        return prontuarioMapper.toResponse(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        Prontuario prontuario = prontuarioRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("Prontuário não encontrado"));
        prontuarioRepository.delete(prontuario);
    }

    @Transactional(readOnly = true)
    public List<ProntuarioResponseDto> buscarPorClienteId(Integer clienteId) {
        List<Prontuario> prontuarios = prontuarioRepository.findByClienteId(clienteId);
        if (prontuarios.isEmpty()) {
            throw new NotFoundException("Nenhum prontuário encontrado para o cliente informado");
        }
        return prontuarios.stream().map(prontuarioMapper::toResponse).toList();
    }
}

