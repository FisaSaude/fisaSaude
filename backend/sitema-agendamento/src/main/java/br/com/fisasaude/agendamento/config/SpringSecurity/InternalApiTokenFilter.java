package br.com.fisasaude.agendamento.config.SpringSecurity;

import br.com.fisasaude.agendamento.config.InternalApiProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class InternalApiTokenFilter extends OncePerRequestFilter {

    private static final String HEADER = "X-Internal-Token";

    private final InternalApiProperties internalApiProperties;

    public InternalApiTokenFilter(InternalApiProperties internalApiProperties) {
        this.internalApiProperties = internalApiProperties;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path == null || !path.startsWith("/internal/")) {
            filterChain.doFilter(request, response);
            return;
        }
        String expected = internalApiProperties.getApiKey();
        if (expected == null || expected.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }
        String sent = request.getHeader(HEADER);
        if (!expected.equals(sent)) {
            response.setStatus(HttpStatus.UNAUTHORIZED.value());
            return;
        }
        filterChain.doFilter(request, response);
    }
}
