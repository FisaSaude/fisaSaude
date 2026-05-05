package br.com.fisasaude.agendamento.controller.authentication;

import br.com.fisasaude.agendamento.dto.authentication.AuthenticationDto;
import br.com.fisasaude.agendamento.dto.authentication.LoginResponseDto;
import br.com.fisasaude.agendamento.exception.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

@Tag(name = "Autenticacao", description = "Endpoints para autenticacao e geracao de tokens JWT")
@SecurityRequirements
public interface SwaggerAuthenticationController {

    @Operation(summary = "Fazer login", description = "Autentica um usuario e retorna um token JWT")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Login realizado com sucesso", content = @Content(schema = @Schema(implementation = LoginResponseDto.class))),
            @ApiResponse(responseCode = "400", description = "Dados invalidos", content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
            @ApiResponse(responseCode = "401", description = "Credenciais invalidas", content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    ResponseEntity<LoginResponseDto> login(@Valid @RequestBody AuthenticationDto dto);
}
