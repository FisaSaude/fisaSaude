package school.sptech.projetoindividual.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import school.sptech.projetoindividual.model.Usuario;
import school.sptech.projetoindividual.model.dto.UsuarioRequestDTO;
import school.sptech.projetoindividual.model.dto.UsuarioResponseDTO;
import school.sptech.projetoindividual.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioValidador validador;
    @Autowired
    private UsuarioRepository repository;

    public UsuarioResponseDTO buscarPorId(Long id){
        Usuario respostaRepository = repository.buscarId(id);
        if (respostaRepository == null) return null;

        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        dto.setNome(respostaRepository.getNome());
        dto.setEmail(respostaRepository.getEmail());
        dto.setTelefone(respostaRepository.getTelefone());
        dto.setDtNascimento(respostaRepository.getDtNascimento());
        dto.setFrequenciaRecebimento(respostaRepository.getFrequenciaRecebimento());
        dto.setAceitaPublicidade(respostaRepository.getAceitaPublicidade());
        dto.setAceitaWhatsapp(respostaRepository.getAceitaWhatsapp());
        dto.setTipoFavoritoNome(respostaRepository.getTipoFavoritoNome());

        return dto;
    }

    public Long criarUsuario(UsuarioRequestDTO dto){
        validador.validarCriacao(dto);

        Usuario usuario = new Usuario();

        // Poderia ter um Mapper
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefone(dto.getTelefone());
        usuario.setDtNascimento(dto.getDtNascimento());
        usuario.setFrequenciaRecebimento(dto.getFrequenciaRecebimento());
        usuario.setAceitaPublicidade(dto.getAceitaPublicidade());
        usuario.setAceitaWhatsapp(dto.getAceitaWhatsapp());
        usuario.setTipoFavorito(dto.getTipoFavoritoId());

        return repository.save(usuario);
    }
}
