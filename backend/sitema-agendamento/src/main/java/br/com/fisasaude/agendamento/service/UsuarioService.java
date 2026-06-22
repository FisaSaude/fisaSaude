package br.com.fisasaude.agendamento.service;

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
import br.com.fisasaude.agendamento.repository.EstabelecimentoRepository;
import br.com.fisasaude.agendamento.repository.UsuarioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private static final int TAMANHO_MINIMO_SENHA = 8;
    private static final String MSG_CORPO_REQUISICAO_NULO = "Corpo da requisicao nao pode ser nulo";
    private static final String MSG_ID_INVALIDO = "Id invalido";
    private static final String MSG_ESTABELECIMENTO_ID_INVALIDO = "estabelecimentoId invalido";
    private static final String MSG_USUARIO_NAO_ENCONTRADO = "Usuario nao encontrado";
    private static final String MSG_ESTABELECIMENTO_NAO_ENCONTRADO = "Estabelecimento nao encontrado";
    private static final String MSG_EMAIL_JA_CADASTRADO = "Ja existe usuario com o email informado";
    private static final String MSG_EMAIL_JA_CADASTRADO_OUTRO_USUARIO = "Ja existe outro usuario com o email informado";
    private static final String MSG_SENHA_INVALIDA = "Senha deve ter no minimo 8 caracteres";

    private final UsuarioRepository usuarioRepository;
    private final EstabelecimentoRepository estabelecimentoRepository;
    private final UsuarioMapper usuarioMapper;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            EstabelecimentoRepository estabelecimentoRepository,
            UsuarioMapper usuarioMapper
    ) {
        this.usuarioRepository = usuarioRepository;
        this.estabelecimentoRepository = estabelecimentoRepository;
        this.usuarioMapper = usuarioMapper;
    }

    @Transactional
    public UsuarioResponseDto criar(UsuarioCreateRequestDto dto) {
        validarDto(dto);

        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new ConflictException(MSG_EMAIL_JA_CADASTRADO);
        }

        validarSenha(dto.senha());

        Estabelecimento estabelecimento = buscarEstabelecimentoPorId(dto.estabelecimentoId());
        Usuario usuario = usuarioMapper.toEntity(dto, estabelecimento);
        return salvarERetornarResponse(usuario);
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponseDto> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(usuarioMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponseDto buscarPorId(Integer id) {
        validarId(id);
        return usuarioMapper.toResponse(buscarUsuarioPorId(id));
    }

    @Transactional
    public UsuarioResponseDto atualizar(Integer id, UsuarioUpdateRequestDto dto) {
        validarId(id);
        validarDto(dto);

        Usuario usuario = buscarUsuarioPorId(id);

        if (usuarioRepository.existsByEmailAndIdNot(dto.email(), id)) {
            throw new ConflictException(MSG_EMAIL_JA_CADASTRADO_OUTRO_USUARIO);
        }

        validarSenha(dto.senha());

        Estabelecimento estabelecimento = buscarEstabelecimentoPorId(dto.estabelecimentoId());
        usuarioMapper.updateEntity(usuario, dto, estabelecimento);
        return salvarERetornarResponse(usuario);
    }

    @Transactional
    public void deletar(Integer id) {
        validarId(id);
        usuarioRepository.delete(buscarUsuarioPorId(id));
    }

    private Estabelecimento buscarEstabelecimentoPorId(Integer estabelecimentoId) {
        if (estabelecimentoId == null || estabelecimentoId <= 0) {
            throw new BadRequestException(MSG_ESTABELECIMENTO_ID_INVALIDO);
        }

        return estabelecimentoRepository.findById(estabelecimentoId)
                .orElseThrow(() -> new NotFoundException(MSG_ESTABELECIMENTO_NAO_ENCONTRADO));
    }

    private Usuario buscarUsuarioPorId(Integer usuarioId) {
        return usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException(MSG_USUARIO_NAO_ENCONTRADO));
    }

    private UsuarioResponseDto salvarERetornarResponse(Usuario usuario) {
        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return usuarioMapper.toResponse(usuarioSalvo);
    }

    private void validarId(Integer id) {
        if (id == null || id <= 0) {
            throw new BadRequestException(MSG_ID_INVALIDO);
        }
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.trim().length() < TAMANHO_MINIMO_SENHA) {
            throw new UnprocessableEntityException(MSG_SENHA_INVALIDA);
        }
    }

    private void validarDto(Object dto) {
        if (dto == null) {
            throw new BadRequestException(MSG_CORPO_REQUISICAO_NULO);
        }
    }
}
