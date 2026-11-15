package br.com.cti.insights.security;

import br.com.cti.insights.repository.ConsultorRepository;
import br.com.cti.insights.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class SecurityFilter extends OncePerRequestFilter {
    private final TokenService tokens;
    private final ConsultorRepository consultores;

    public SecurityFilter(TokenService tokens, ConsultorRepository consultores) {
        this.tokens = tokens;
        this.consultores = consultores;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            String email = tokens.validarEObterEmail(header.substring(7));
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                consultores.findByEmailIgnoreCase(email).ifPresent(consultor -> {
                    var authentication = new UsernamePasswordAuthenticationToken(
                            consultor, null, List.of(new SimpleGrantedAuthority("ROLE_" + consultor.getPerfil().name())));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                });
            }
        }
        chain.doFilter(request, response);
    }
}
