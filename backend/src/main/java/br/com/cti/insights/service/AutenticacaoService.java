package br.com.cti.insights.service;

import br.com.cti.insights.dto.CadastroDTO;
import br.com.cti.insights.dto.LoginDTO;
import br.com.cti.insights.dto.TokenDTO;
import br.com.cti.insights.model.Consultor;
import br.com.cti.insights.model.Perfil;
import br.com.cti.insights.repository.ConsultorRepository;
import br.com.cti.insights.exception.EmailJaCadastradoException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AutenticacaoService {
    private final ConsultorRepository consultores;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokens;

    public AutenticacaoService(ConsultorRepository consultores, PasswordEncoder passwordEncoder, TokenService tokens) {
        this.consultores = consultores;
        this.passwordEncoder = passwordEncoder;
        this.tokens = tokens;
    }

    @Transactional
    public Consultor cadastrar(CadastroDTO dados) {
        String email = dados.email().trim().toLowerCase();
        if (consultores.existsByEmailIgnoreCase(email)) throw new EmailJaCadastradoException();
        Consultor consultor = new Consultor();
        consultor.setNome(dados.nome().trim());
        consultor.setEmail(email);
        consultor.setSenha(passwordEncoder.encode(dados.senha()));
        consultor.setPerfil(Perfil.USER);
        return consultores.save(consultor);
    }

    public TokenDTO login(LoginDTO dados) {
        Consultor consultor = consultores.findByEmailIgnoreCase(dados.email().trim())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas."));
        if (!passwordEncoder.matches(dados.senha(), consultor.getSenha())) {
            throw new BadCredentialsException("Credenciais inválidas.");
        }
        return new TokenDTO(tokens.gerar(consultor), consultor.getNome(), consultor.getEmail(), consultor.getPerfil().name());
    }
}
