package br.com.fisasaude.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioCreateRequestDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioResponseDto;
import br.com.fisasaude.agendamento.dto.prontuario.ProntuarioUpdateRequestDto;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.mapper.ProntuarioMapper;
import br.com.fisasaude.agendamento.model.entity.Cliente;
import br.com.fisasaude.agendamento.model.entity.Prontuario;
import br.com.fisasaude.agendamento.model.enums.SexoEnum;
import br.com.fisasaude.agendamento.repository.ClienteRepository;
import br.com.fisasaude.agendamento.repository.ProntuarioRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProntuarioServiceTest {

    @Mock
    private ProntuarioRepository prontuarioRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ProntuarioMapper prontuarioMapper;

    @InjectMocks
    private ProntuarioService service;

    private Cliente cliente;
    private Prontuario prontuario;
    private ProntuarioResponseDto responseDto;
    private ProntuarioCreateRequestDto createDto;
    private ProntuarioUpdateRequestDto updateDto;
    private LocalDateTime agora;

    @BeforeEach
    void init() {
        agora = LocalDateTime.now();

        cliente = new Cliente();
        cliente.setId(10);
        cliente.setNome("Ana");
        cliente.setTelefone("5511999999999");
        cliente.setDataNascimento(LocalDate.of(1990, 1, 1));
        cliente.setSexo(SexoEnum.F);

        prontuario = new Prontuario(1, "Paciente com dor lombar", agora, cliente);

        responseDto = new ProntuarioResponseDto(1, "Paciente com dor lombar", agora, 10);

        createDto = new ProntuarioCreateRequestDto("Paciente com dor lombar", agora, 10);

        updateDto = new ProntuarioUpdateRequestDto("Paciente com dor lombar – atualizado");
    }

    // ─────────────────────────────────────────────────────────────
    // criar
    // ─────────────────────────────────────────────────────────────

    @Test
    void criar_clienteNaoEncontrado_lancaNotFound() {
        when(clienteRepository.findById(10)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.criar(createDto))
                .isInstanceOf(NotFoundException.class);
        verify(prontuarioRepository, never()).save(any());
    }

    @Test
    void criar_sucesso_retornaDto() {
        when(clienteRepository.findById(10)).thenReturn(Optional.of(cliente));
        when(prontuarioMapper.toEntity(createDto, cliente)).thenReturn(prontuario);
        when(prontuarioRepository.save(prontuario)).thenReturn(prontuario);
        when(prontuarioMapper.toResponse(prontuario)).thenReturn(responseDto);

        ProntuarioResponseDto result = service.criar(createDto);

        assertThat(result.id()).isEqualTo(1);
        assertThat(result.observacoes()).isEqualTo("Paciente com dor lombar");
        assertThat(result.clienteId()).isEqualTo(10);
        verify(prontuarioRepository).save(prontuario);
    }

    // ─────────────────────────────────────────────────────────────
    // listarTodos
    // ─────────────────────────────────────────────────────────────

    @Test
    void listarTodos_retornaListaComItens() {
        when(prontuarioRepository.findAll()).thenReturn(List.of(prontuario));
        when(prontuarioMapper.toResponse(prontuario)).thenReturn(responseDto);

        List<ProntuarioResponseDto> result = service.listarTodos();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().id()).isEqualTo(1);
    }

    @Test
    void listarTodos_semRegistros_retornaListaVazia() {
        when(prontuarioRepository.findAll()).thenReturn(List.of());

        List<ProntuarioResponseDto> result = service.listarTodos();

        assertThat(result).isEmpty();
    }

    // ─────────────────────────────────────────────────────────────
    // buscarPorId
    // ─────────────────────────────────────────────────────────────

    @Test
    void buscarPorId_naoEncontrado_lancaNotFound() {
        when(prontuarioRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void buscarPorId_sucesso_retornaDto() {
        when(prontuarioRepository.findById(1)).thenReturn(Optional.of(prontuario));
        when(prontuarioMapper.toResponse(prontuario)).thenReturn(responseDto);

        ProntuarioResponseDto result = service.buscarPorId(1);

        assertThat(result.id()).isEqualTo(1);
        assertThat(result.observacoes()).isEqualTo("Paciente com dor lombar");
    }

    // ─────────────────────────────────────────────────────────────
    // atualizar
    // ─────────────────────────────────────────────────────────────

    @Test
    void atualizar_naoEncontrado_lancaNotFound() {
        when(prontuarioRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.atualizar(99, updateDto))
                .isInstanceOf(NotFoundException.class);
        verify(prontuarioRepository, never()).save(any());
    }

    @Test
    void atualizar_sucesso_chamaUpdateEntityESalva() {
        ProntuarioResponseDto updatedResponse =
                new ProntuarioResponseDto(1, "Paciente com dor lombar – atualizado", agora, 10);

        when(prontuarioRepository.findById(1)).thenReturn(Optional.of(prontuario));
        when(prontuarioRepository.save(prontuario)).thenReturn(prontuario);
        when(prontuarioMapper.toResponse(prontuario)).thenReturn(updatedResponse);

        ProntuarioResponseDto result = service.atualizar(1, updateDto);

        verify(prontuarioMapper).updateEntity(prontuario, updateDto);
        verify(prontuarioRepository).save(prontuario);
        assertThat(result.observacoes()).isEqualTo("Paciente com dor lombar – atualizado");
    }

    // ─────────────────────────────────────────────────────────────
    // deletar
    // ─────────────────────────────────────────────────────────────

    @Test
    void deletar_naoEncontrado_lancaNotFound() {
        when(prontuarioRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deletar(99))
                .isInstanceOf(NotFoundException.class);
        verify(prontuarioRepository, never()).delete(any());
    }

    @Test
    void deletar_sucesso_chamaDelete() {
        when(prontuarioRepository.findById(1)).thenReturn(Optional.of(prontuario));

        service.deletar(1);

        verify(prontuarioRepository).delete(prontuario);
    }

    // ─────────────────────────────────────────────────────────────
    // buscarPorClienteId
    // ─────────────────────────────────────────────────────────────

    @Test
    void buscarPorClienteId_semRegistros_lancaNotFound() {
        when(prontuarioRepository.findByClienteId(10)).thenReturn(List.of());

        assertThatThrownBy(() -> service.buscarPorClienteId(10))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void buscarPorClienteId_sucesso_retornaLista() {
        when(prontuarioRepository.findByClienteId(10)).thenReturn(List.of(prontuario));
        when(prontuarioMapper.toResponse(prontuario)).thenReturn(responseDto);

        List<ProntuarioResponseDto> result = service.buscarPorClienteId(10);

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().clienteId()).isEqualTo(10);
    }

    @Test
    void buscarPorClienteId_multiplosRegistros_retornaTodos() {
        Prontuario p2 = new Prontuario(2, "Retorno – sem queixas", agora.plusDays(7), cliente);
        ProntuarioResponseDto r2 = new ProntuarioResponseDto(2, "Retorno – sem queixas", agora.plusDays(7), 10);

        when(prontuarioRepository.findByClienteId(10)).thenReturn(List.of(prontuario, p2));
        when(prontuarioMapper.toResponse(prontuario)).thenReturn(responseDto);
        when(prontuarioMapper.toResponse(p2)).thenReturn(r2);

        List<ProntuarioResponseDto> result = service.buscarPorClienteId(10);

        assertThat(result).hasSize(2);
        assertThat(result.get(1).id()).isEqualTo(2);
    }
}