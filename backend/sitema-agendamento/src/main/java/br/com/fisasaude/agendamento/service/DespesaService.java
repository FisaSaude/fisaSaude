package br.com.fisasaude.agendamento.service;

import br.com.fisasaude.agendamento.dto.despesa.DespesaCreateRequestDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaResponseDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaUpdateRequestDto;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.mapper.DespesaMapper;
import br.com.fisasaude.agendamento.model.entity.Despesa;
import br.com.fisasaude.agendamento.model.entity.Estabelecimento;
import br.com.fisasaude.agendamento.repository.DespesaRepository;
import br.com.fisasaude.agendamento.repository.EstabelecimentoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class DespesaService {
    private final DespesaRepository despesaRepository;
    private final EstabelecimentoRepository estabelecimentoRepository;
    private final DespesaMapper despesaMapper;

    public DespesaService(DespesaRepository despesaRepository, EstabelecimentoRepository estabelecimentoRepository, DespesaMapper despesaMapper) {
        this.despesaRepository = despesaRepository;
        this.estabelecimentoRepository = estabelecimentoRepository;
        this.despesaMapper = despesaMapper;
    }

    @Transactional
    public DespesaResponseDto criar(DespesaCreateRequestDto dto) {
        Estabelecimento estabelecimento = buscarEstabelecimento(dto.estabelecimentoId());
        Despesa entity = despesaMapper.toEntity(dto, estabelecimento);
        Despesa salvo = despesaRepository.save(entity);
        return despesaMapper.toResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<DespesaResponseDto> listarTodos() {
        return despesaRepository.findAll().stream().map(despesaMapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DespesaResponseDto buscarPorId(Integer id) {
        Despesa entity = despesaRepository.findById(id).orElseThrow(() -> new NotFoundException("Despesa não encontrada"));
        return despesaMapper.toResponse(entity);
    }

    @Transactional
    public DespesaResponseDto atualizar(Integer id, DespesaUpdateRequestDto dto) {
        Despesa entity = despesaRepository.findById(id).orElseThrow(() -> new NotFoundException("Despesa não encontrada"));
        Estabelecimento estabelecimento = buscarEstabelecimento(dto.estabelecimentoId());
        despesaMapper.updateEntity(entity, dto, estabelecimento);
        Despesa atualizado = despesaRepository.save(entity);
        return despesaMapper.toResponse(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        Despesa entity = despesaRepository.findById(id).orElseThrow(() -> new NotFoundException("Despesa não encontrada"));
        despesaRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public List<DespesaResponseDto> listarPorEstabelecimentoId(Integer estabelecimentoId, java.time.LocalDate dataInicio, java.time.LocalDate dataFim) {
        List<Despesa> despesas;
        if (dataInicio != null && dataFim != null) {
            despesas = despesaRepository.findByEstabelecimentoIdAndDataDespesaBetween(estabelecimentoId, dataInicio, dataFim);
        } else {
            despesas = despesaRepository.findByEstabelecimentoId(estabelecimentoId);
        }
        return despesas.stream().map(despesaMapper::toResponse).toList();
    }

    private Estabelecimento buscarEstabelecimento(Integer id) {
        if (id == null) throw new BadRequestException("Estabelecimento é obrigatório");
        return estabelecimentoRepository.findById(id).orElseThrow(() -> new NotFoundException("Estabelecimento não encontrado"));
    }
}
