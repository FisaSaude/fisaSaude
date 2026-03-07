package school.sptech.projetoindividual.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import school.sptech.projetoindividual.model.dto.TipoNoticiaResponseDTO;
import school.sptech.projetoindividual.service.TipoNoticiaService;

import java.util.List;

@RestController
@RequestMapping
public class TipoNoticiaController {

    @Autowired
    private TipoNoticiaService service;

    @GetMapping("/tiposNoticia")
    public ResponseEntity<List<TipoNoticiaResponseDTO>> bucarTiposNoticia(){
        List<TipoNoticiaResponseDTO> resposta = service.buscarTiposNoticia();

        if(resposta.isEmpty()) return ResponseEntity.noContent().build();

        return ResponseEntity.ok(resposta);
    }

}
