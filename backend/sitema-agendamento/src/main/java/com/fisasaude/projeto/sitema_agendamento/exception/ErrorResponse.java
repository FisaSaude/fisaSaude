package com.fisasaude.projeto.sitema_agendamento.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Formato padrao de erro da API")
public record ErrorResponse(
        @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss")
        @Schema(description = "Data/hora do erro", example = "2026-03-28T10:15:30")
        LocalDateTime timestamp,
        @Schema(description = "Codigo HTTP", example = "404")
        int status,
        @Schema(description = "Nome curto do erro HTTP", example = "Not Found")
        String error,
        @Schema(description = "Mensagem detalhada do erro", example = "Cliente nao encontrado")
        String message,
        @Schema(description = "Endpoint onde ocorreu o erro", example = "/clientes/99")
        String path
) {
}

