package school.sptech.projetoindividual.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import school.sptech.projetoindividual.model.TipoNoticia;
import school.sptech.projetoindividual.model.dto.TipoNoticiaResponseDTO;
import school.sptech.projetoindividual.repository.TipoNoticiaRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class TipoNoticiaService {
    @Autowired
    private TipoNoticiaRepository repository;

    public List<TipoNoticiaResponseDTO> buscarTiposNoticia() {
        List<TipoNoticia> repostaRepository =  repository.buscarTiposNoticia();

        //Poderia ter um Mapper
        List<TipoNoticiaResponseDTO> repostaService = new ArrayList<>();
        for (TipoNoticia tipoNoticia : repostaRepository) {
            TipoNoticiaResponseDTO dto = new TipoNoticiaResponseDTO();
            dto.setId(tipoNoticia.getId());
            dto.setTipoNoticia(tipoNoticia.getTipoNoticia());

            repostaService.add(dto);
        }

        return repostaService;
    }
}
