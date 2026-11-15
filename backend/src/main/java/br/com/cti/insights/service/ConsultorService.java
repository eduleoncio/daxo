package br.com.cti.insights.service;

import br.com.cti.insights.model.Consultor;
import br.com.cti.insights.repository.ConsultorRepository;
import br.com.cti.insights.exception.ConsultorNaoEncontradoException;
import br.com.cti.insights.exception.EmailJaCadastradoException;
import jakarta.transaction.Transactional;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
public class ConsultorService {

    private final ConsultorRepository repository;
    private final PasswordEncoder passwordEncoder;

    public ConsultorService(ConsultorRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Consultor criar(Consultor consultor) {
        validarDadosObrigatorios(consultor);
        consultor.setEmail(consultor.getEmail().trim().toLowerCase(Locale.ROOT));
        if (repository.existsByEmailIgnoreCase(consultor.getEmail())) throw new EmailJaCadastradoException();

        consultor.setSenha(passwordEncoder.encode(consultor.getSenha()));
        return repository.save(consultor);
    }

    public Consultor buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ConsultorNaoEncontradoException(id));
    }

    public Consultor login(String email, String senha) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("E-mail obrigat\u00f3rio");
        }
        if (senha == null || senha.isBlank()) {
            throw new RuntimeException("Senha obrigat\u00f3ria");
        }

        Consultor consultor = repository.findByEmailIgnoreCase(email.trim())
                .orElseThrow(() -> new BadCredentialsException("Credenciais inválidas."));

        if (!passwordEncoder.matches(senha, consultor.getSenha())) throw new BadCredentialsException("Credenciais inválidas.");

        return consultor;
    }

    public List<Consultor> listar() {
        return repository.findAll();
    }

    @Transactional
    public Consultor atualizar(Long id, Consultor dadosAtualizados) {
        validarDadosObrigatorios(dadosAtualizados);
        dadosAtualizados.setEmail(dadosAtualizados.getEmail().trim().toLowerCase(Locale.ROOT));

        Consultor consultor = buscarPorId(id);
        repository.findByEmailIgnoreCase(dadosAtualizados.getEmail())
                .filter(existente -> !existente.getId().equals(id))
                .ifPresent(existente -> { throw new EmailJaCadastradoException(); });

        consultor.setNome(dadosAtualizados.getNome());
        consultor.setEmail(dadosAtualizados.getEmail());
        consultor.setSenha(passwordEncoder.encode(dadosAtualizados.getSenha()));

        return repository.save(consultor);
    }

    @Transactional
    public void deletar(Long id) {
        Consultor consultor = buscarPorId(id);
        repository.delete(consultor);
    }

    private void validarDadosObrigatorios(Consultor consultor) {
        if (consultor.getNome() == null || consultor.getNome().isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório.");
        }
        if (consultor.getEmail() == null || consultor.getEmail().isBlank()) {
            throw new IllegalArgumentException("E-mail é obrigatório.");
        }
        if (consultor.getSenha() == null || consultor.getSenha().isBlank()) {
            throw new IllegalArgumentException("Senha é obrigatória.");
        }
    }
}
