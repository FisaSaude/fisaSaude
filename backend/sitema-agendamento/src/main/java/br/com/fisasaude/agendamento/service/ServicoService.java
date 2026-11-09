package br.com.fisasaude.agendamento.service;

import br.com.fisasaude.agendamento.dto.servico.ServicoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.servico.ServicoResponseDto;
import br.com.fisasaude.agendamento.dto.servico.ServicoUpdateRequestDto;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.ConflictException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.exception.UnprocessableEntityException;
import br.com.fisasaude.agendamento.mapper.ServicoMapper;
import br.com.fisasaude.agendamento.model.entity.Servico;
import br.com.fisasaude.agendamento.repository.AgendamentoRepository;
import br.com.fisasaude.agendamento.repository.ServicoRepository;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ServicoService {

    private static final int DURACAO_MINIMA_MINUTOS = 15;
    private static final int DURACAO_MAXIMA_MINUTOS = 480;
    private static final String MSG_CORPO_REQUISICAO_NULO = "Corpo da requisicao nao pode ser nulo";
    private static final String MSG_ID_INVALIDO = "Id invalido";
    private static final String MSG_SERVICO_NAO_ENCONTRADO = "Servico nao encontrado";
    private static final String MSG_SERVICO_COM_AGENDAMENTOS =
            "Nao e possivel excluir servico com agendamentos vinculados";

    private final ServicoRepository servicoRepository;
    private final AgendamentoRepository agendamentoRepository;
    private final ServicoMapper servicoMapper;

    public ServicoService(
            ServicoRepository servicoRepository,
            AgendamentoRepository agendamentoRepository,
            ServicoMapper servicoMapper
    ) {
        this.servicoRepository = servicoRepository;
        this.agendamentoRepository = agendamentoRepository;
        this.servicoMapper = servicoMapper;
    }

    @Transactional
    public ServicoResponseDto criar(ServicoCreateRequestDto dto) {
        validarDto(dto);
        validarPrecoEDuracao(dto.preco(), dto.duracaoMinutos());

        Servico servico = servicoMapper.toEntity(dto);
        return salvarERetornarResponse(servico);
    }

    @Transactional(readOnly = true)
    public List<ServicoResponseDto> listarTodos() {
        return servicoRepository.findAll().stream()
                .map(servicoMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ServicoResponseDto buscarPorId(Integer id) {
        validarId(id);
        return servicoMapper.toResponse(buscarServicoPorId(id));
    }

    @Transactional
    public ServicoResponseDto atualizar(Integer id, ServicoUpdateRequestDto dto) {
        validarId(id);
        validarDto(dto);
        validarPrecoEDuracao(dto.preco(), dto.duracaoMinutos());

        Servico servico = buscarServicoPorId(id);
        servicoMapper.updateEntity(servico, dto);
        return salvarERetornarResponse(servico);
    }

    @Transactional
    public void deletar(Integer id) {
        validarId(id);
        Servico servico = buscarServicoPorId(id);

        if (agendamentoRepository.existsByServicoId(id)) {
            throw new ConflictException(MSG_SERVICO_COM_AGENDAMENTOS);
        }

        servicoRepository.delete(servico);
    }

    private Servico buscarServicoPorId(Integer id) {
        return servicoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MSG_SERVICO_NAO_ENCONTRADO));
    }

    private ServicoResponseDto salvarERetornarResponse(Servico servico) {
        return servicoMapper.toResponse(servicoRepository.save(servico));
    }

    private void validarPrecoEDuracao(BigDecimal preco, Integer duracaoMinutos) {
        if (preco == null || preco.compareTo(BigDecimal.ZERO) <= 0) {
            throw new UnprocessableEntityException("Preco deve ser maior que zero");
        }

        if (duracaoMinutos != null
                && (duracaoMinutos < DURACAO_MINIMA_MINUTOS || duracaoMinutos > DURACAO_MAXIMA_MINUTOS)) {
            throw new UnprocessableEntityException("Duracao deve estar entre 15 e 480 minutos");
        }
    }

    private void validarId(Integer id) {
        if (id == null || id <= 0) {
            throw new BadRequestException(MSG_ID_INVALIDO);
        }
    }

    private void validarDto(Object dto) {
        if (dto == null) {
            throw new BadRequestException(MSG_CORPO_REQUISICAO_NULO);
        }
    }
}
