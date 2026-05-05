package br.com.fisasaude.notificacao.config;

import br.com.fisasaude.notificacao.exception.ErrorResponse;
import com.twilio.exception.TwilioException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /** Erros ao chamar REST da Twilio (credenciais, rede, recurso invalido etc.). */
    @ExceptionHandler(TwilioException.class)
    public ResponseEntity<ErrorResponse> handleTwilio(TwilioException ex, HttpServletRequest request) {
        log.warn("Integracao Twilio falhou ao processar {}.", request.getRequestURI(), ex);
        String msg =
                ex.getMessage() != null ? ex.getMessage() : "Falha ao comunicar com a API Twilio.";
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(ErrorResponse.of(HttpStatus.BAD_GATEWAY, msg, request.getRequestURI()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(f -> f.getField() + ": " + f.getDefaultMessage())
                .sorted()
                .collect(Collectors.joining("; "));
        if (msg.isBlank()) {
            msg = "Dados da requisicao invalidos.";
        }
        return build(HttpStatus.BAD_REQUEST, msg, request.getRequestURI());
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParam(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        String msg = "Parametro obrigatorio ausente: " + ex.getParameterName();
        return build(HttpStatus.BAD_REQUEST, msg, request.getRequestURI());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        Class<?> rt = ex.getRequiredType();
        String typeHint = rt != null ? rt.getSimpleName() : "?";
        String msg = String.format(
                "Parametro '%s' invalido ou nao pode ser convertido para %s", ex.getName(), typeHint);
        return build(HttpStatus.BAD_REQUEST, msg, request.getRequestURI());
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest request) {
        String msg = ex.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .sorted()
                .collect(Collectors.joining("; "));
        if (msg.isBlank()) {
            msg = "Restricoes de validacao violadas.";
        }
        return build(HttpStatus.BAD_REQUEST, msg, request.getRequestURI());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUncaught(Exception ex, HttpServletRequest request) {
        log.error("Erro interno ao processar {}", request.getRequestURI(), ex);
        return build(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Erro interno ao processar a requisicao.",
                request.getRequestURI());
    }

    private static ResponseEntity<ErrorResponse> build(HttpStatus status, String message, String path) {
        return ResponseEntity.status(status).body(ErrorResponse.of(status, message, path));
    }
}
