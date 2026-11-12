package br.com.fisasaude.agendamento.controller.senha;

import br.com.fisasaude.agendamento.model.entity.Usuario;
import br.com.fisasaude.agendamento.repository.UsuarioRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/auth")
public class RecuperacaoSenhaController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JavaMailSender mailSender;
    private final SecureRandom random = new SecureRandom();

    private final Map<String, CodigoRecuperacao> codigos =
            new ConcurrentHashMap<>();

    public RecuperacaoSenhaController(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JavaMailSender mailSender) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.mailSender = mailSender;
    }

    @PostMapping("/recuperar-senha")
    public ResponseEntity<?> recuperarSenha(
            @RequestBody RecuperacaoRequest request) {

        if (request == null || request.getEmail() == null
                || request.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Informe seu e-mail."));
        }

        String email = normalizarEmail(request.getEmail());

        Object resultado = usuarioRepository.findByEmail(email);

        if (!(resultado instanceof Usuario)) {
            return ResponseEntity.ok(Map.of(
                    "mensagem",
                    "Se o e-mail estiver cadastrado, você receberá um código."
            ));
        }

        String codigo = String.format(
                "%06d", random.nextInt(1_000_000));

        CodigoRecuperacao registro = new CodigoRecuperacao(
                codigo,
                LocalDateTime.now().plusMinutes(10)
        );

        try {
            SimpleMailMessage mensagem = new SimpleMailMessage();
            mensagem.setTo(email);
            mensagem.setSubject("Recuperação de senha - FISA Saúde");
            mensagem.setText(
                    "Olá!\n\n" +
                            "Você solicitou a recuperação da senha do FISA Saúde.\n\n" +
                            "Seu código é: " + codigo + "\n\n" +
                            "Ele expira em 10 minutos. Se você não fez essa " +
                            "solicitação, ignore este e-mail."
            );

            mailSender.send(mensagem);
            codigos.put(email, registro);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "mensagem",
                            "Não foi possível enviar o e-mail. Tente novamente."
                    ));
        }

        return ResponseEntity.ok(Map.of(
                "mensagem",
                "Se o e-mail estiver cadastrado, você receberá um código."
        ));
    }

    @PostMapping("/validar-codigo")
    public ResponseEntity<?> validarCodigo(
            @RequestBody ValidarCodigoRequest request) {

        if (request == null || request.getEmail() == null
                || request.getCodigo() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Informe o e-mail e o código."));
        }

        String email = normalizarEmail(request.getEmail());

        if (!codigoValido(email, request.getCodigo())) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Código inválido ou expirado."));
        }

        return ResponseEntity.ok(
                Map.of("mensagem", "Código validado com sucesso."));
    }

    @PostMapping("/redefinir-senha")
    public ResponseEntity<?> redefinirSenha(
            @RequestBody RedefinirSenhaRequest request) {

        if (request == null || request.getEmail() == null
                || request.getCodigo() == null
                || request.getNovaSenha() == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Preencha todos os campos."));
        }

        String email = normalizarEmail(request.getEmail());
        String novaSenha = request.getNovaSenha();

        if (novaSenha.length() < 8 || novaSenha.length() > 100) {
            return ResponseEntity.badRequest().body(
                    Map.of(
                            "mensagem",
                            "A senha deve ter entre 8 e 100 caracteres."
                    ));
        }

        if (!codigoValido(email, request.getCodigo())) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Código inválido ou expirado."));
        }

        Object resultado = usuarioRepository.findByEmail(email);

        if (!(resultado instanceof Usuario usuario)) {
            return ResponseEntity.badRequest().body(
                    Map.of("mensagem", "Não foi possível redefinir a senha."));
        }

        usuario.setSenha(passwordEncoder.encode(novaSenha));
        usuarioRepository.save(usuario);

        codigos.remove(email);

        return ResponseEntity.ok(
                Map.of("mensagem", "Senha redefinida com sucesso."));
    }

    private boolean codigoValido(String email, String codigoInformado) {
        CodigoRecuperacao registro = codigos.get(email);

        if (registro == null || codigoInformado == null) {
            return false;
        }

        synchronized (registro) {
            if (LocalDateTime.now().isAfter(registro.expiraEm)
                    || registro.tentativas >= 5) {
                codigos.remove(email, registro);
                return false;
            }

            registro.tentativas++;

            boolean valido = registro.codigo.equals(codigoInformado.trim());

            if (!valido && registro.tentativas >= 5) {
                codigos.remove(email, registro);
            }

            return valido;
        }
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    public static class RecuperacaoRequest {
        private String email;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }
    }

    public static class ValidarCodigoRequest {
        private String email;
        private String codigo;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getCodigo() {
            return codigo;
        }

        public void setCodigo(String codigo) {
            this.codigo = codigo;
        }
    }

    public static class RedefinirSenhaRequest {
        private String email;
        private String codigo;
        private String novaSenha;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getCodigo() {
            return codigo;
        }

        public void setCodigo(String codigo) {
            this.codigo = codigo;
        }

        public String getNovaSenha() {
            return novaSenha;
        }

        public void setNovaSenha(String novaSenha) {
            this.novaSenha = novaSenha;
        }
    }

    private static class CodigoRecuperacao {
        private final String codigo;
        private final LocalDateTime expiraEm;
        private int tentativas;

        private CodigoRecuperacao(
                String codigo,
                LocalDateTime expiraEm) {
            this.codigo = codigo;
            this.expiraEm = expiraEm;
            this.tentativas = 0;
        }
    }
}
