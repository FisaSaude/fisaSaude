package br.com.fisasaude.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ServicoServiceTest {

    @Mock
    private ServicoRepository servicoRepository;

    @Mock
    private AgendamentoRepository agendamentoRepository;

    @Mock
    private ServicoMapper servicoMapper;

    @InjectMocks
    private ServicoService service;

    private Servico servico;
    private ServicoResponseDto responseDto;
    private ServicoCreateRequestDto createDto;
    private ServicoUpdateRequestDto updateDto;

    @BeforeEach
    void init() {
        servico = new Servico();
        servico.setId(5);
        servico.setNome("Pilates");
        servico.setTipo("Fisioterapia");
        servico.setPreco(new BigDecimal("120.00"));
        servico.setDuracaoMinutos(60);
        servico.setAtivo(true);

        responseDto = new ServicoResponseDto(
                5, "Pilates", "Fisioterapia", new BigDecimal("120.00"), 60, true);
        createDto = new ServicoCreateRequestDto(
                "Pilates", "Fisioterapia", new BigDecimal("120.00"), 60, true);
        updateDto = new ServicoUpdateRequestDto(
                "Pilates avancado", "Fisioterapia", new BigDecimal("150.00"), 90, false);
    }

    @Test
    void criar_dtoNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.criar(null))
                .isInstanceOf(BadRequestException.class);
        verify(servicoRepository, never()).save(any());
    }

    @Test
    void criar_precoZero_lancaUnprocessable() {
        ServicoCreateRequestDto dto = new ServicoCreateRequestDto(
                "Pilates", "Fisioterapia", BigDecimal.ZERO, 60, true);

        assertThatThrownBy(() -> service.criar(dto))
                .isInstanceOf(UnprocessableEntityException.class);
        verify(servicoRepository, never()).save(any());
    }

    @Test
    void criar_duracaoForaDaFaixa_lancaUnprocessable() {
        ServicoCreateRequestDto dto = new ServicoCreateRequestDto(
                "Pilates", "Fisioterapia", new BigDecimal("120.00"), 481, true);

        assertThatThrownBy(() -> service.criar(dto))
                .isInstanceOf(UnprocessableEntityException.class);
        verify(servicoRepository, never()).save(any());
    }

    @Test
    void criar_sucesso_retornaDto() {
        when(servicoMapper.toEntity(createDto)).thenReturn(servico);
        when(servicoRepository.save(servico)).thenReturn(servico);
        when(servicoMapper.toResponse(servico)).thenReturn(responseDto);

        ServicoResponseDto result = service.criar(createDto);

        assertThat(result.id()).isEqualTo(5);
        assertThat(result.nome()).isEqualTo("Pilates");
        verify(servicoRepository).save(servico);
    }

    @Test
    void listarTodos_retornaListaComItens() {
        when(servicoRepository.findAll()).thenReturn(List.of(servico));
        when(servicoMapper.toResponse(servico)).thenReturn(responseDto);

        List<ServicoResponseDto> result = service.listarTodos();

        assertThat(result).containsExactly(responseDto);
    }

    @Test
    void listarTodos_semRegistros_retornaListaVazia() {
        when(servicoRepository.findAll()).thenReturn(List.of());

        assertThat(service.listarTodos()).isEmpty();
    }

    @Test
    void buscarPorId_idInvalido_lancaBadRequest() {
        assertThatThrownBy(() -> service.buscarPorId(0))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void buscarPorId_naoEncontrado_lancaNotFound() {
        when(servicoRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void buscarPorId_sucesso_retornaDto() {
        when(servicoRepository.findById(5)).thenReturn(Optional.of(servico));
        when(servicoMapper.toResponse(servico)).thenReturn(responseDto);

        assertThat(service.buscarPorId(5)).isEqualTo(responseDto);
    }

    @Test
    void atualizar_servicoNaoEncontrado_lancaNotFound() {
        when(servicoRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.atualizar(99, updateDto))
                .isInstanceOf(NotFoundException.class);
        verify(servicoRepository, never()).save(any());
    }

    @Test
    void atualizar_sucessoAtualizaEDevolveDto() {
        ServicoResponseDto updatedResponse = new ServicoResponseDto(
                5, "Pilates avancado", "Fisioterapia", new BigDecimal("150.00"), 90, false);
        when(servicoRepository.findById(5)).thenReturn(Optional.of(servico));
        when(servicoRepository.save(servico)).thenReturn(servico);
        when(servicoMapper.toResponse(servico)).thenReturn(updatedResponse);

        ServicoResponseDto result = service.atualizar(5, updateDto);

        verify(servicoMapper).updateEntity(servico, updateDto);
        verify(servicoRepository).save(servico);
        assertThat(result.ativo()).isFalse();
    }

    @Test
    void deletar_idInvalido_lancaBadRequest() {
        assertThatThrownBy(() -> service.deletar(-1))
                .isInstanceOf(BadRequestException.class);
        verify(servicoRepository, never()).delete(any(Servico.class));
    }

    @Test
    void deletar_servicoNaoEncontrado_lancaNotFound() {
        when(servicoRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deletar(99))
                .isInstanceOf(NotFoundException.class);
        verify(servicoRepository, never()).delete(any(Servico.class));
    }

    @Test
    void deletar_comAgendamentos_lancaConflictENaoExclui() {
        when(servicoRepository.findById(5)).thenReturn(Optional.of(servico));
        when(agendamentoRepository.existsByServicoId(5)).thenReturn(true);

        assertThatThrownBy(() -> service.deletar(5))
                .isInstanceOf(ConflictException.class);
        verify(servicoRepository, never()).delete(any(Servico.class));
    }

    @Test
    void deletar_semAgendamentos_excluiServico() {
        when(servicoRepository.findById(5)).thenReturn(Optional.of(servico));
        when(agendamentoRepository.existsByServicoId(5)).thenReturn(false);

        service.deletar(5);

        verify(servicoRepository).delete(servico);
    }
}
