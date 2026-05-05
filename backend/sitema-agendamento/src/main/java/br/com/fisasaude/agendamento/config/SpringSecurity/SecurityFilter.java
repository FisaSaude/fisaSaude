package br.com.fisasaude.agendamento.config.SpringSecurity;

import br.com.fisasaude.agendamento.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@Order(Ordered.LOWEST_PRECEDENCE - 50)
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    public SecurityFilter(TokenService tokenService, UsuarioRepository usuarioRepository) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        // Rotas /internal são autenticadas só por X-Internal-Token (InternalApiTokenFilter), sem JWT.
        if (ehRotaInterna(request)) {
            filterChain.doFilter(request, response);
            return;
        }
        String token = this.recoverToken(request);
        if(token != null) {
            String email = tokenService.validateToken(token);
            UserDetails user = usuarioRepository.findByEmail(email);
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if(authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }

    private static boolean ehRotaInterna(HttpServletRequest request) {
        String path = servletPathOuUri(request);
        return path.startsWith("/internal");
    }

    /** Path relativo ao contexto da app (evita falsos negativos com context-path não vazio). */
    private static String servletPathOuUri(HttpServletRequest request) {
        String path = request.getServletPath();
        if (path != null && !path.isBlank()) {
            return path;
        }
        String uri = request.getRequestURI();
        if (uri == null || uri.isEmpty()) {
            return "/";
        }
        String context = request.getContextPath();
        if (context != null && !context.isEmpty() && uri.startsWith(context)) {
            return uri.substring(context.length());
        }
        return uri;
    }
}
