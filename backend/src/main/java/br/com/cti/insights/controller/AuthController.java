package br.com.cti.insights.controller;

import br.com.cti.insights.dto.CadastroDTO;
import br.com.cti.insights.dto.ConsultorRespostaDTO;
import br.com.cti.insights.dto.LoginDTO;
import br.com.cti.insights.dto.TokenDTO;
import br.com.cti.insights.model.Consultor;
import br.com.cti.insights.service.AutenticacaoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AutenticacaoService autenticacao;

    public AuthController(AutenticacaoService autenticacao) { this.autenticacao = autenticacao; }

    @PostMapping("/register")
    public ResponseEntity<ConsultorRespostaDTO> cadastrar(@Valid @RequestBody CadastroDTO dados) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ConsultorRespostaDTO.de(autenticacao.cadastrar(dados)));
    }

    @PostMapping("/login")
    public TokenDTO login(@Valid @RequestBody LoginDTO dados) { return autenticacao.login(dados); }

    @GetMapping("/me")
    public ConsultorRespostaDTO eu(@AuthenticationPrincipal Consultor consultor) { return ConsultorRespostaDTO.de(consultor); }
}
