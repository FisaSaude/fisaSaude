package br.com.fisasaude.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.agendamento.dto.cliente.ClienteCreateRequestDto;
import br.com.fisasaude.agendamento.dto.cliente.ClienteResponseDto;
import br.com.fisasaude.agendamento.dto.cliente.ClienteUpdateRequestDto;
import br.com.fisasaude.agendamento.mapper.ClienteMapper;
import br.com.fisasaude.agendamento.model.entity.Cliente;
import br.com.fisasaude.agendamento.model.enums.SexoEnum;
import br.com.fisasaude.agendamento.repository.ClienteRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ClienteServiceTest {

    private static final String TELEFONE = "5511965643020";

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private ClienteMapper clienteMapper;

    @InjectMocks
    private ClienteService service;

    private Cliente cliente;
    private ClienteCreateRequestDto createDto;
    private ClienteUpdateRequestDto updateDto;
    private ClienteResponseDto responseDto;

    @BeforeEach
    void init() {
        cliente = new Cliente();
        cliente.setId(10);
        cliente.setNome("Edson Felix Sptech");
        cliente.setTelefone(TELEFONE);
        cliente.setWhatsappAtivo(true);
        cliente.setDataNascimento(LocalDate.of(1990, 3, 15));
        cliente.setSexo(SexoEnum.M);
        cliente.setFotoLink("https://google.com/foto.jpg");

        createDto = new ClienteCreateRequestDto(
                "Edson Felix Sptech",
                TELEFONE,
                true,
                LocalDate.of(1990, 3, 15),
                SexoEnum.M,
                "https://google.com/foto.jpg");

        updateDto = new ClienteUpdateRequestDto(
                "Edson Felix Sptech",
                "5511988887777",
                true,
                LocalDate.of(1990, 3, 15),
                SexoEnum.M,
                "https://google.com/foto-nova.jpg");

        responseDto = new ClienteResponseDto(
                10,
                "Edson Felix Sptech",
                TELEFONE,
                true,
                LocalDate.of(1990, 3, 15),
                SexoEnum.M,
                "https://google.com/foto.jpg");
    }

    @Test
    void criar() {
        when(clienteRepository.existsByTelefone(TELEFONE)).thenReturn(false);
        when(clienteMapper.toEntity(createDto)).thenReturn(cliente);
        when(clienteRepository.save(cliente)).thenReturn(cliente);
        when(clienteMapper.toResponse(cliente)).thenReturn(responseDto);

        ClienteResponseDto resultado = service.criar(createDto);

        assertThat(resultado).isNotNull();
        assertThat(resultado.nome()).isEqualTo("Edson Felix Sptech");
        verify(clienteRepository).save(cliente);
    }

    @Test
    void listarTodos() {
        when(clienteRepository.findAll()).thenReturn(List.of(cliente));
        when(clienteMapper.toResponse(cliente)).thenReturn(responseDto);

        List<ClienteResponseDto> lista = service.listarTodos();

        assertThat(lista).hasSize(1);
        assertThat(lista.getFirst().id()).isEqualTo(10);
    }

    @Test
    void buscarPorId() {
        when(clienteRepository.findById(10)).thenReturn(Optional.of(cliente));
        when(clienteMapper.toResponse(cliente)).thenReturn(responseDto);

        ClienteResponseDto resultado = service.buscarPorId(10);

        assertThat(resultado.telefone()).isEqualTo(TELEFONE);
    }

    @Test
    void atualizar() {
        ClienteResponseDto responseAtualizado = new ClienteResponseDto(
                10,
                updateDto.nome(),
                updateDto.telefone(),
                true,
                updateDto.dataNascimento(),
                SexoEnum.M,
                updateDto.fotoLink());

        when(clienteRepository.findById(10)).thenReturn(Optional.of(cliente));
        when(clienteRepository.existsByTelefoneAndIdNot(updateDto.telefone(), 10)).thenReturn(false);
        when(clienteRepository.save(cliente)).thenReturn(cliente);
        when(clienteMapper.toResponse(cliente)).thenReturn(responseAtualizado);

        ClienteResponseDto resultado = service.atualizar(10, updateDto);

        assertThat(resultado.nome()).isEqualTo("Edson Felix Sptech");
        verify(clienteMapper).updateEntity(cliente, updateDto);
        verify(clienteRepository).save(cliente);
    }

    @Test
    void deletar() {
        when(clienteRepository.findById(10)).thenReturn(Optional.of(cliente));

        service.deletar(10);

        verify(clienteRepository).delete(cliente);
    }
}
