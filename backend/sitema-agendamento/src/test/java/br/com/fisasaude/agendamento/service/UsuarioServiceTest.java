package br.com.fisasaude.agendamento.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.fisasaude.agendamento.dto.usuario.UsuarioCreateRequestDto;
import br.com.fisasaude.agendamento.dto.usuario.UsuarioResponseDto;
import br.com.fisasaude.agendamento.dto.usuario.UsuarioUpdateRequestDto;
import br.com.fisasaude.agendamento.exception.BadRequestException;
import br.com.fisasaude.agendamento.exception.ConflictException;
import br.com.fisasaude.agendamento.exception.NotFoundException;
import br.com.fisasaude.agendamento.exception.UnprocessableEntityException;
import br.com.fisasaude.agendamento.mapper.UsuarioMapper;
import br.com.fisasaude.agendamento.model.entity.Estabelecimento;
import br.com.fisasaude.agendamento.model.entity.Usuario;
import br.com.fisasaude.agendamento.model.enums.RoleEnum;
import br.com.fisasaude.agendamento.repository.EstabelecimentoRepository;
import br.com.fisasaude.agendamento.repository.UsuarioRepository;
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
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EstabelecimentoRepository estabelecimentoRepository;

    @Mock
    private UsuarioMapper usuarioMapper;

    @InjectMocks
    private UsuarioService service;

    private Estabelecimento estab;
    private Usuario usuario;
    private UsuarioResponseDto responseDto;
    private UsuarioCreateRequestDto createDto;
    private UsuarioUpdateRequestDto updateDto;

    @BeforeEach
    void init() {
        estab = new Estabelecimento();
        estab.setId(1);
        estab.setNome("Clinica");
        estab.setEndereco("Rua A, 1");
        estab.setInicioFuncionamento(LocalTime.of(8, 0));
        estab.setFimFuncionamento(LocalTime.of(18, 0));

        usuario = new Usuario();
        usuario.setId(30);
        usuario.setNome("Prof Ana");
        usuario.setEmail("ana@test.com");
        usuario.setSenha("senha123");
        usuario.setRole(RoleEnum.USUARIO);
        usuario.setEstabelecimento(estab);

        responseDto = new UsuarioResponseDto(30, "Prof Ana", "ana@test.com", RoleEnum.USUARIO, 1, "Clinica");

        createDto = new UsuarioCreateRequestDto("Prof Ana", "ana@test.com", "senha123", RoleEnum.USUARIO, 1);

        updateDto = new UsuarioUpdateRequestDto("Prof Ana V2", "anav2@test.com", "senha456", RoleEnum.ADMIN, 1);
    }

    // ─────────────────────────────────────────────────────────────
    // criar
    // ─────────────────────────────────────────────────────────────

    @Test
    void criar_dtoNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.criar(null))
                .isInstanceOf(BadRequestException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void criar_emailDuplicado_lancaConflict() {
        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(true);

        assertThatThrownBy(() -> service.criar(createDto))
                .isInstanceOf(ConflictException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void criar_senhaComMenosDe8Caracteres_lancaUnprocessable() {
        UsuarioCreateRequestDto dtoCurtaSenha =
                new UsuarioCreateRequestDto("Prof Ana", "ana@test.com", "abc", RoleEnum.USUARIO, 1);
        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(false);

        assertThatThrownBy(() -> service.criar(dtoCurtaSenha))
                .isInstanceOf(UnprocessableEntityException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void criar_senhaNula_lancaUnprocessable() {
        UsuarioCreateRequestDto dtoSenhaNula =
                new UsuarioCreateRequestDto("Prof Ana", "ana@test.com", null, RoleEnum.USUARIO, 1);
        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(false);

        assertThatThrownBy(() -> service.criar(dtoSenhaNula))
                .isInstanceOf(UnprocessableEntityException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void criar_estabelecimentoIdNulo_lancaBadRequest() {
        UsuarioCreateRequestDto dtoSemEstab =
                new UsuarioCreateRequestDto("Prof Ana", "ana@test.com", "senha123", RoleEnum.USUARIO, null);
        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(false);

        assertThatThrownBy(() -> service.criar(dtoSemEstab))
                .isInstanceOf(BadRequestException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void criar_estabelecimentoIdZero_lancaBadRequest() {
        UsuarioCreateRequestDto dtoEstabZero =
                new UsuarioCreateRequestDto("Prof Ana", "ana@test.com", "senha123", RoleEnum.USUARIO, 0);
        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(false);

        assertThatThrownBy(() -> service.criar(dtoEstabZero))
                .isInstanceOf(BadRequestException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void criar_estabelecimentoNaoEncontrado_lancaNotFound() {
        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(false);
        when(estabelecimentoRepository.findById(1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.criar(createDto))
                .isInstanceOf(NotFoundException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void criar_sucesso_retornaDto() {
        when(usuarioRepository.existsByEmail("ana@test.com")).thenReturn(false);
        when(estabelecimentoRepository.findById(1)).thenReturn(Optional.of(estab));
        when(usuarioMapper.toEntity(createDto, estab)).thenReturn(usuario);
        when(usuarioRepository.save(usuario)).thenReturn(usuario);
        when(usuarioMapper.toResponse(usuario)).thenReturn(responseDto);

        UsuarioResponseDto result = service.criar(createDto);

        assertThat(result.id()).isEqualTo(30);
        assertThat(result.nome()).isEqualTo("Prof Ana");
        assertThat(result.email()).isEqualTo("ana@test.com");
        assertThat(result.estabelecimentoId()).isEqualTo(1);
        verify(usuarioRepository).save(usuario);
    }

    // ─────────────────────────────────────────────────────────────
    // listarTodos
    // ─────────────────────────────────────────────────────────────

    @Test
    void listarTodos_retornaListaComItens() {
        when(usuarioRepository.findAll()).thenReturn(List.of(usuario));
        when(usuarioMapper.toResponse(usuario)).thenReturn(responseDto);

        List<UsuarioResponseDto> result = service.listarTodos();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().nome()).isEqualTo("Prof Ana");
    }

    @Test
    void listarTodos_semRegistros_retornaListaVazia() {
        when(usuarioRepository.findAll()).thenReturn(List.of());

        List<UsuarioResponseDto> result = service.listarTodos();

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
    void buscarPorId_idNegativo_lancaBadRequest() {
        assertThatThrownBy(() -> service.buscarPorId(-5))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void buscarPorId_naoEncontrado_lancaNotFound() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.buscarPorId(99))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void buscarPorId_sucesso_retornaDto() {
        when(usuarioRepository.findById(30)).thenReturn(Optional.of(usuario));
        when(usuarioMapper.toResponse(usuario)).thenReturn(responseDto);

        UsuarioResponseDto result = service.buscarPorId(30);

        assertThat(result.id()).isEqualTo(30);
        assertThat(result.email()).isEqualTo("ana@test.com");
    }

    // ─────────────────────────────────────────────────────────────
    // atualizar
    // ─────────────────────────────────────────────────────────────

    @Test
    void atualizar_idNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.atualizar(null, updateDto))
                .isInstanceOf(BadRequestException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void atualizar_dtoNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.atualizar(30, null))
                .isInstanceOf(BadRequestException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void atualizar_naoEncontrado_lancaNotFound() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.atualizar(99, updateDto))
                .isInstanceOf(NotFoundException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void atualizar_emailDuplicadoEmOutroUsuario_lancaConflict() {
        when(usuarioRepository.findById(30)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmailAndIdNot("anav2@test.com", 30)).thenReturn(true);

        assertThatThrownBy(() -> service.atualizar(30, updateDto))
                .isInstanceOf(ConflictException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void atualizar_senhaInvalida_lancaUnprocessable() {
        UsuarioUpdateRequestDto dtoCurtaSenha =
                new UsuarioUpdateRequestDto("Prof Ana V2", "anav2@test.com", "123", RoleEnum.ADMIN, 1);

        when(usuarioRepository.findById(30)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmailAndIdNot("anav2@test.com", 30)).thenReturn(false);

        assertThatThrownBy(() -> service.atualizar(30, dtoCurtaSenha))
                .isInstanceOf(UnprocessableEntityException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void atualizar_estabelecimentoNaoEncontrado_lancaNotFound() {
        when(usuarioRepository.findById(30)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmailAndIdNot("anav2@test.com", 30)).thenReturn(false);
        when(estabelecimentoRepository.findById(1)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.atualizar(30, updateDto))
                .isInstanceOf(NotFoundException.class);
        verify(usuarioRepository, never()).save(any());
    }

    @Test
    void atualizar_sucesso_retornaDto() {
        UsuarioResponseDto updatedResponse =
                new UsuarioResponseDto(30, "Prof Ana V2", "anav2@test.com", RoleEnum.ADMIN, 1, "Clinica");

        when(usuarioRepository.findById(30)).thenReturn(Optional.of(usuario));
        when(usuarioRepository.existsByEmailAndIdNot("anav2@test.com", 30)).thenReturn(false);
        when(estabelecimentoRepository.findById(1)).thenReturn(Optional.of(estab));
        when(usuarioRepository.save(usuario)).thenReturn(usuario);
        when(usuarioMapper.toResponse(usuario)).thenReturn(updatedResponse);

        UsuarioResponseDto result = service.atualizar(30, updateDto);

        verify(usuarioMapper).updateEntity(usuario, updateDto, estab);
        verify(usuarioRepository).save(usuario);
        assertThat(result.nome()).isEqualTo("Prof Ana V2");
        assertThat(result.email()).isEqualTo("anav2@test.com");
    }

    // ─────────────────────────────────────────────────────────────
    // deletar
    // ─────────────────────────────────────────────────────────────

    @Test
    void deletar_idNulo_lancaBadRequest() {
        assertThatThrownBy(() -> service.deletar(null))
                .isInstanceOf(BadRequestException.class);
        verify(usuarioRepository, never()).delete(any());
    }

    @Test
    void deletar_idZero_lancaBadRequest() {
        assertThatThrownBy(() -> service.deletar(0))
                .isInstanceOf(BadRequestException.class);
        verify(usuarioRepository, never()).delete(any());
    }

    @Test
    void deletar_naoEncontrado_lancaNotFound() {
        when(usuarioRepository.findById(99)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deletar(99))
                .isInstanceOf(NotFoundException.class);
        verify(usuarioRepository, never()).delete(any());
    }

    @Test
    void deletar_sucesso_chamaDelete() {
        when(usuarioRepository.findById(30)).thenReturn(Optional.of(usuario));

        service.deletar(30);

        verify(usuarioRepository).delete(usuario);
    }
}

