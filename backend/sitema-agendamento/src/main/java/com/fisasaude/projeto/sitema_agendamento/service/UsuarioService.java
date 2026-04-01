package com.fisasaude.projeto.sitema_agendamento.service;

import com.fisasaude.projeto.sitema_agendamento.dto.UsuarioCreateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.dto.UsuarioResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.UsuarioUpdateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.exception.BadRequestException;
import com.fisasaude.projeto.sitema_agendamento.exception.ConflictException;
import com.fisasaude.projeto.sitema_agendamento.exception.NotFoundException;
import com.fisasaude.projeto.sitema_agendamento.exception.UnprocessableEntityException;
import com.fisasaude.projeto.sitema_agendamento.mapper.UsuarioMapper;
import com.fisasaude.projeto.sitema_agendamento.model.Estabelecimento;
import com.fisasaude.projeto.sitema_agendamento.model.Usuario;
import com.fisasaude.projeto.sitema_agendamento.repository.EstabelecimentoRepository;
import com.fisasaude.projeto.sitema_agendamento.repository.UsuarioRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EstabelecimentoRepository estabelecimentoRepository;
    private final UsuarioMapper usuarioMapper;

    public UsuarioService(UsuarioRepository usuarioRepository, EstabelecimentoRepository estabelecimentoRepository, UsuarioMapper usuarioMapper) {
        this.usuarioRepository = usuarioRepository;
        this.estabelecimentoRepository = estabelecimentoRepository;
        this.usuarioMapper = usuarioMapper;
    }

    @Transactional
    public UsuarioResponseDto criar(UsuarioCreateRequestDto dto) {
        validarDto(dto);

        if (usuarioRepository.existsByEmail(dto.email())) {
            throw new ConflictException("Ja existe usuario com o email informado");
        }

        validarSenha(dto.senha());

        Estabelecimento estabelecimento = buscarEstabelecimentoPorId(dto.estabelecimentoId());
        Usuario usuario = usuarioMapper.toEntity(dto, estabelecimento);

        Usuario salvo = usuarioRepository.save(usuario);
        return usuarioMapper.toResponse(salvo);
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

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));

        return usuarioMapper.toResponse(usuario);
    }

    @Transactional
    public UsuarioResponseDto atualizar(Integer id, UsuarioUpdateRequestDto dto) {
        validarId(id);
        validarDto(dto);

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));

        if (usuarioRepository.existsByEmailAndIdNot(dto.email(), id)) {
            throw new ConflictException("Ja existe outro usuario com o email informado");
        }

        validarSenha(dto.senha());

        Estabelecimento estabelecimento = buscarEstabelecimentoPorId(dto.estabelecimentoId());
        usuarioMapper.updateEntity(usuario, dto, estabelecimento);

        Usuario atualizado = usuarioRepository.save(usuario);
        return usuarioMapper.toResponse(atualizado);
    }

    @Transactional
    public void deletar(Integer id) {
        validarId(id);

        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario nao encontrado"));

        usuarioRepository.delete(usuario);
    }

    private Estabelecimento buscarEstabelecimentoPorId(Integer estabelecimentoId) {
        if (estabelecimentoId == null || estabelecimentoId <= 0) {
            throw new BadRequestException("estabelecimentoId invalido");
        }

        return estabelecimentoRepository.findById(estabelecimentoId)
                .orElseThrow(() -> new NotFoundException("Estabelecimento nao encontrado"));
    }

    private void validarId(Integer id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Id invalido");
        }
    }

    private void validarSenha(String senha) {
        if (senha == null || senha.trim().length() < 8) {
            throw new UnprocessableEntityException("Senha deve ter no minimo 8 caracteres");
        }
    }

    private void validarDto(Object dto) {
        if (dto == null) {
            throw new BadRequestException("Corpo da requisicao nao pode ser nulo");
        }
    }
}
