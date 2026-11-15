package br.com.cti.insights.controller;

import br.com.cti.insights.model.Consultor;
import br.com.cti.insights.service.ConsultorService;
import br.com.cti.insights.dto.CadastroDTO;
import br.com.cti.insights.dto.ConsultorRespostaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/consultores")
public class ConsultorController {

    private final ConsultorService service;

    public ConsultorController(ConsultorService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConsultorRespostaDTO criar(@Valid @RequestBody CadastroDTO dados) {
        return ConsultorRespostaDTO.de(service.criar(novoConsultor(dados)));
    }

    @GetMapping
    public List<ConsultorRespostaDTO> listar() {
        return service.listar().stream().map(ConsultorRespostaDTO::de).toList();
    }

    @GetMapping("/{id}")
    public ConsultorRespostaDTO buscarPorId(@PathVariable Long id) {
        return ConsultorRespostaDTO.de(service.buscarPorId(id));
    }

    @PutMapping("/{id}")
    public ConsultorRespostaDTO atualizar(@PathVariable Long id, @Valid @RequestBody CadastroDTO dados) {
        return ConsultorRespostaDTO.de(service.atualizar(id, novoConsultor(dados)));
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }

    private Consultor novoConsultor(CadastroDTO dados) {
        Consultor consultor = new Consultor();
        consultor.setNome(dados.nome());
        consultor.setEmail(dados.email());
        consultor.setSenha(dados.senha());
        return consultor;
    }
}
