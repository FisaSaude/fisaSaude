package br.com.fisasaude.agendamento.service;

import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoResponseDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoUpdateRequestDto;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.mapper.EstabelecimentoMapper;
import br.com.fisasaude.agendamento.model.entity.Estabelecimento;
import br.com.fisasaude.agendamento.repository.EstabelecimentoRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EstabelecimentoService {

    private final EstabelecimentoRepository estabelecimentoRepository;
    private final EstabelecimentoMapper estabelecimentoMapper;

    public EstabelecimentoService(EstabelecimentoRepository estabelecimentoRepository, EstabelecimentoMapper estabelecimentoMapper) {
        this.estabelecimentoRepository = estabelecimentoRepository;
        this.estabelecimentoMapper = estabelecimentoMapper;
    }

    @Transactional
    public EstabelecimentoResponseDto criar(EstabelecimentoCreateRequestDto dto) {
        validarDto(dto);
        Estabelecimento e = estabelecimentoMapper.toEntity(dto);
        Estabelecimento salvo = estabelecimentoRepository.save(e);
        return estabelecimentoMapper.toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<EstabelecimentoResponseDto> listarTodos() {
        return estabelecimentoRepository.findAll().stream()
                .map(estabelecimentoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public EstabelecimentoResponseDto buscarPorId(Integer id) {
        validarId(id);
        Estabelecimento e = estabelecimentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estabelecimento nao encontrado"));
        return estabelecimentoMapper.toResponse(e);
    }

    @Transactional
    public EstabelecimentoResponseDto atualizar(Integer id, EstabelecimentoUpdateRequestDto dto) {
        validarId(id);
        validarDto(dto);
        Estabelecimento e = estabelecimentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estabelecimento nao encontrado"));

        estabelecimentoMapper.updateEntity(e, dto);
        Estabelecimento atualizado = estabelecimentoRepository.save(e);
        return estabelecimentoMapper.toResponse(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        validarId(id);
        Estabelecimento e = estabelecimentoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Estabelecimento nao encontrado"));
        estabelecimentoRepository.delete(e);
    }

    private void validarId(Integer id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Id invalido");
        }
    }

    private void validarDto(Object dto) {
        if (dto == null) {
            throw new BadRequestException("Corpo da requisicao nao pode ser nulo");
        }
    }
}

