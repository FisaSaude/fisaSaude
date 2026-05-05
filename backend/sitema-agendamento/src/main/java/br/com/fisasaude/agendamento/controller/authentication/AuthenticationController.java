package br.com.fisasaude.agendamento.controller.authentication;

import br.com.fisasaude.agendamento.config.SpringSecurity.TokenService;
import br.com.fisasaude.agendamento.dto.authentication.AuthenticationDto;
import br.com.fisasaude.agendamento.dto.authentication.LoginResponseDto;
import br.com.fisasaude.agendamento.model.entity.Usuario;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthenticationController implements SwaggerAuthenticationController {

    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthenticationController(AuthenticationManager authenticationManager, TokenService tokenService) {
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody AuthenticationDto dto) {
        UsernamePasswordAuthenticationToken emailSenha = new UsernamePasswordAuthenticationToken(dto.email(), dto.senha());
        Authentication auth = authenticationManager.authenticate(emailSenha);

        Usuario usuario = (Usuario) auth.getPrincipal();
        String token = tokenService.generateToken(usuario);
        return ResponseEntity.ok(new LoginResponseDto(
                token,
                usuario.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getEstabelecimento().getId(),
                usuario.getEstabelecimento().getNome()
        ));
    }

}
