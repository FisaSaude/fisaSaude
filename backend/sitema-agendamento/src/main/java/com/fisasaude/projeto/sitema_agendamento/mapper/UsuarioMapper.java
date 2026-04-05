package com.fisasaude.projeto.sitema_agendamento.mapper;

import com.fisasaude.projeto.sitema_agendamento.dto.usuario.UsuarioCreateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.dto.usuario.UsuarioResponseDto;
import com.fisasaude.projeto.sitema_agendamento.dto.usuario.UsuarioUpdateRequestDto;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Estabelecimento;
import com.fisasaude.projeto.sitema_agendamento.model.entity.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public Usuario toEntity(UsuarioCreateRequestDto dto, Estabelecimento estabelecimento) {
        Usuario usuario = new Usuario();
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(dto.senha());
        usuario.setRole(dto.role());
        usuario.setEstabelecimento(estabelecimento);
        return usuario;
    }

    public void updateEntity(Usuario usuario, UsuarioUpdateRequestDto dto, Estabelecimento estabelecimento) {
        usuario.setNome(dto.nome());
        usuario.setEmail(dto.email());
        usuario.setSenha(dto.senha());
        usuario.setRole(dto.role());
        usuario.setEstabelecimento(estabelecimento);
    }

    public UsuarioResponseDto toResponse(Usuario usuario) {
        return new UsuarioResponseDto(
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getRole(),
                usuario.getEstabelecimento().getId(),
                usuario.getEstabelecimento().getNome()
        );
    }
}
