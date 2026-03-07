package school.sptech.projetoindividual.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.sptech.projetoindividual.model.dto.UsuarioRequestDTO;
import school.sptech.projetoindividual.model.dto.UsuarioResponseDTO;
import school.sptech.projetoindividual.service.UsuarioService;

import java.net.URI;


@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> buscarPorId(@PathVariable Long id){
        if (id <= 0) return ResponseEntity.badRequest().build();
        UsuarioResponseDTO dto = service.buscarPorId(id);
        if (dto == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<Void> criarUsuario(@RequestBody UsuarioRequestDTO dto){
        Long idCriado = service.criarUsuario(dto);
        URI endereco = URI.create("usuarios/" + idCriado);
        return ResponseEntity.created(endereco).build();
    }
}
