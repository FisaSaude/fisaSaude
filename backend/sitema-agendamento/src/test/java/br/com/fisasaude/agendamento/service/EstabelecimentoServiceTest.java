package br.com.fisasaude.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoCreateRequestDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoResponseDto;
import br.com.fisasaude.agendamento.dto.estabelecimento.EstabelecimentoUpdateRequestDto;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.mapper.EstabelecimentoMapper;
import br.com.fisasaude.agendamento.model.entity.Estabelecimento;
import br.com.fisasaude.agendamento.repository.EstabelecimentoRepository;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EstabelecimentoServiceTest {

    @Mock
    private EstabelecimentoRepository estabelecimentoRepository;

    @Mock
    private EstabelecimentoMapper estabelecimentoMapper;

    @InjectMocks
    private EstabelecimentoService service;

    private Estabelecimento estab;
    private EstabelecimentoResponseDto responseDto;
    private EstabelecimentoCreateRequestDto createDto;
    private EstabelecimentoUpdateRequestDto updateDto;

    @BeforeEach
    void init() {
        estab = new Estabelecimento();
        estab.setId(1);
        estab.setNome("Clinica Saude");
        estab.setEndereco("Rua das Flores, 10");
        estab.setInicioFuncionamento(LocalTime.of(8, 0));
        estab.setFimFuncionamento(LocalTime.of(18, 0));
        estab.setTelefone("11999999999");
        estab.setCriadoEm(LocalDateTime.now());

        responseDto = new EstabelecimentoResponseDto(
                1, "Clinica Saude", "Rua das Flores, 10", null,
                LocalTime.of(8, 0), LocalTime.of(18, 0), "11999999999", estab.getCriadoEm()
        );

        createDto = new EstabelecimentoCreateRequestDto(
                "Clinica Saude", "Rua das Flores, 10", null,
                LocalTime.of(8, 0), LocalTime.of(18, 0), "11999999999"
        );

        updateDto = new EstabelecimentoUpdateRequestDto(
                "Clinica Saude Updated", "Rua Nova, 20", null,
                LocalTime.of(9, 0), LocalTime.of(19, 0), "11888888888"
        );
    }

    // ─────────────────────────────────────────────────────────────
    // criar
    // ─────────────────────────────────────────────────────────────

    @Test
    void criar_dtoNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.criar(null))
                .isInstanceOf(BadRequestException.class);
        verify(estabelecimentoRepository, never()).save(any());
    }

    @Test
    void criar_sucesso_retornaDto() {
        when(estabelecimentoMapper.toEntity(createDto)).thenReturn(estab);
        when(estabelecimentoRepository.save(estab)).thenReturn(estab);
        when(estabelecimentoMapper.toResponse(estab)).thenReturn(responseDto);

        EstabelecimentoResponseDto result = service.criar(createDto);

        assertThat(result.id()).isEqualTo(1);
        assertThat(result.nome()).isEqualTo("Clinica Saude");
        verify(estabelecimentoRepository).save(estab);
    }

    // ─────────────────────────────────────────────────────────────
    // listarTodos
    // ─────────────────────────────────────────────────────────────

    @Test
    void listarTodos_retornaListaComItens() {
        when(estabelecimentoRepository.findAll()).thenReturn(List.of(estab));
        when(estabelecimentoMapper.toResponse(estab)).thenReturn(responseDto);

        List<EstabelecimentoResponseDto> result = service.listarTodos();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().nome()).isEqualTo("Clinica Saude");
    }

    @Test
    void listarTodos_semRegistros_retornaListaVazia() {
        when(estabelecimentoRepository.findAll()).thenReturn(List.of());

        List<EstabelecimentoResponseDto> result = service.listarTodos();

        assertThat(result).isEmpty();
    }

    // ─────────────────────────────────────────────────────────────
    // buscarPorId
    // ─────────────────────────────────────────────────────────────

    @Test
    void buscarPorId_idNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.buscarPorId(null))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void buscarPorId_idZero_lancaBadRequest() {
        assertThatThrownBy(() -> service.buscarPorId(0))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void buscarPorId_naoEncontrado_lancaNotFound() {
        when(estabelecimentoRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void buscarPorId_sucesso_retornaDto() {
        when(estabelecimentoRepository.findById(1)).thenReturn(Optional.of(estab));
        when(estabelecimentoMapper.toResponse(estab)).thenReturn(responseDto);

        EstabelecimentoResponseDto result = service.buscarPorId(1);

        assertThat(result.id()).isEqualTo(1);
        assertThat(result.nome()).isEqualTo("Clinica Saude");
    }

    // ─────────────────────────────────────────────────────────────
    // atualizar
    // ─────────────────────────────────────────────────────────────

    @Test
    void atualizar_idNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.atualizar(null, updateDto))
                .isInstanceOf(BadRequestException.class);
        verify(estabelecimentoRepository, never()).save(any());
    }

    @Test
    void atualizar_dtoNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.atualizar(1, null))
                .isInstanceOf(BadRequestException.class);
        verify(estabelecimentoRepository, never()).save(any());
    }

    @Test
    void atualizar_naoEncontrado_lancaNotFound() {
        when(estabelecimentoRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.atualizar(99, updateDto))
                .isInstanceOf(NotFoundException.class);
        verify(estabelecimentoRepository, never()).save(any());
    }

    @Test
    void atualizar_sucesso_chamaUpdateEntityESalva() {
        EstabelecimentoResponseDto updatedResponse = new EstabelecimentoResponseDto(
                1, "Clinica Saude Updated", "Rua Nova, 20", null,
                LocalTime.of(9, 0), LocalTime.of(19, 0), "11888888888", estab.getCriadoEm()
        );

        when(estabelecimentoRepository.findById(1)).thenReturn(Optional.of(estab));
        when(estabelecimentoRepository.save(estab)).thenReturn(estab);
        when(estabelecimentoMapper.toResponse(estab)).thenReturn(updatedResponse);

        EstabelecimentoResponseDto result = service.atualizar(1, updateDto);

        verify(estabelecimentoMapper).updateEntity(estab, updateDto);
        verify(estabelecimentoRepository).save(estab);
        assertThat(result.nome()).isEqualTo("Clinica Saude Updated");
    }

    // ─────────────────────────────────────────────────────────────
    // deletar
    // ─────────────────────────────────────────────────────────────

    @Test
    void deletar_idNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.deletar(null))
                .isInstanceOf(BadRequestException.class);
        verify(estabelecimentoRepository, never()).delete(any());
    }

    @Test
    void deletar_idNegativo_lancaBadRequest() {
        assertThatThrownBy(() -> service.deletar(-1))
                .isInstanceOf(BadRequestException.class);
        verify(estabelecimentoRepository, never()).delete(any());
    }

    @Test
    void deletar_naoEncontrado_lancaNotFound() {
        when(estabelecimentoRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deletar(99))
                .isInstanceOf(NotFoundException.class);
        verify(estabelecimentoRepository, never()).delete(any());
    }

    @Test
    void deletar_sucesso_chamaDelete() {
        when(estabelecimentoRepository.findById(1)).thenReturn(Optional.of(estab));

        service.deletar(1);

        verify(estabelecimentoRepository).delete(estab);
    }
}