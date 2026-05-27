package br.com.fisasaude.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.agendamento.dto.despesa.DespesaCreateRequestDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaResponseDto;
import br.com.fisasaude.agendamento.dto.despesa.DespesaUpdateRequestDto;
import br.com.fisasaude.agendamento.mapper.DespesaMapper;
import br.com.fisasaude.agendamento.model.entity.Despesa;
import br.com.fisasaude.agendamento.model.entity.Estabelecimento;
import br.com.fisasaude.agendamento.repository.DespesaRepository;
import br.com.fisasaude.agendamento.repository.EstabelecimentoRepository;
import java.math.BigDecimal;
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
class DespesaServiceTest {

    private static final String NOME = "Edson Felix Sptech";

    @Mock
    private DespesaRepository despesaRepository;

    @Mock
    private EstabelecimentoRepository estabelecimentoRepository;

    @Mock
    private DespesaMapper despesaMapper;

    @InjectMocks
    private DespesaService service;

    private Estabelecimento estabelecimento;
    private Despesa despesa;
    private DespesaCreateRequestDto createDto;
    private DespesaUpdateRequestDto updateDto;
    private DespesaResponseDto responseDto;

    @BeforeEach
    void init() {
        estabelecimento = new Estabelecimento();
        estabelecimento.setId(1);
        estabelecimento.setNome("Fisa Saude Unidade Central");

        despesa = new Despesa();
        despesa.setId(10);
        despesa.setNome(NOME);
        despesa.setDataDespesa(LocalDate.of(2026, 1, 15));
        despesa.setTipo("Operacional");
        despesa.setValor(new BigDecimal("350.00"));
        despesa.setEstabelecimento(estabelecimento);

        createDto = new DespesaCreateRequestDto(
                NOME,
                LocalDate.of(2026, 1, 15),
                "Operacional",
                new BigDecimal("350.00"),
                1);

        updateDto = new DespesaUpdateRequestDto(
                NOME,
                LocalDate.of(2026, 2, 1),
                "Operacional",
                new BigDecimal("400.00"),
                1);

        responseDto = new DespesaResponseDto(10, NOME, LocalDate.of(2026, 1, 15), "Operacional", new BigDecimal("350.00"), 1);
    }

    @Test
    void criar() {
        when(estabelecimentoRepository.findById(1)).thenReturn(Optional.of(estabelecimento));
        when(despesaMapper.toEntity(createDto, estabelecimento)).thenReturn(despesa);
        when(despesaRepository.save(despesa)).thenReturn(despesa);
        when(despesaMapper.toResponse(despesa)).thenReturn(responseDto);

        DespesaResponseDto resultado = service.criar(createDto);

        assertThat(resultado).isNotNull();
        assertThat(resultado.nome()).isEqualTo(NOME);
        verify(despesaRepository).save(despesa);
    }

    @Test
    void listarTodos() {
        when(despesaRepository.findAll()).thenReturn(List.of(despesa));
        when(despesaMapper.toResponse(despesa)).thenReturn(responseDto);

        List<DespesaResponseDto> lista = service.listarTodos();

        assertThat(lista).hasSize(1);
        assertThat(lista.getFirst().nome()).isEqualTo(NOME);
    }

    @Test
    void buscarPorId() {
        when(despesaRepository.findById(10)).thenReturn(Optional.of(despesa));
        when(despesaMapper.toResponse(despesa)).thenReturn(responseDto);

        DespesaResponseDto resultado = service.buscarPorId(10);

        assertThat(resultado.id()).isEqualTo(10);
        assertThat(resultado.nome()).isEqualTo(NOME);
    }

    @Test
    void atualizar() {
        DespesaResponseDto responseAtualizado =
                new DespesaResponseDto(10, NOME, updateDto.dataDespesa(), updateDto.tipo(), updateDto.valor(), 1);

        when(despesaRepository.findById(10)).thenReturn(Optional.of(despesa));
        when(estabelecimentoRepository.findById(1)).thenReturn(Optional.of(estabelecimento));
        when(despesaRepository.save(despesa)).thenReturn(despesa);
        when(despesaMapper.toResponse(despesa)).thenReturn(responseAtualizado);

        DespesaResponseDto resultado = service.atualizar(10, updateDto);

        assertThat(resultado.valor()).isEqualByComparingTo(new BigDecimal("400.00"));
        verify(despesaMapper).updateEntity(despesa, updateDto, estabelecimento);
        verify(despesaRepository).save(despesa);
    }

    @Test
    void deletar() {
        when(despesaRepository.findById(10)).thenReturn(Optional.of(despesa));

        service.deletar(10);

        verify(despesaRepository).delete(despesa);
    }

    @Test
    void listarPorEstabelecimentoId() {
        when(despesaRepository.findByEstabelecimentoId(1)).thenReturn(List.of(despesa));
        when(despesaMapper.toResponse(despesa)).thenReturn(responseDto);

        List<DespesaResponseDto> lista = service.listarPorEstabelecimentoId(1, null, null);

        assertThat(lista).hasSize(1);
        assertThat(lista.getFirst().estabelecimentoId()).isEqualTo(1);
    }
}
