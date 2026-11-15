package br.com.cti.insights.controller;

import br.com.cti.insights.dto.ClienteDTO;
import br.com.cti.insights.dto.ProcessamentoClientesDTO;
import br.com.cti.insights.service.ClienteValidacaoService;
import br.com.cti.insights.service.PythonEtlService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/clientes")
public class ClienteValidacaoController {
    private final ClienteValidacaoService service;
    private final PythonEtlService pythonEtlService;

    public ClienteValidacaoController(ClienteValidacaoService service, PythonEtlService pythonEtlService) {
        this.service = service;
        this.pythonEtlService = pythonEtlService;
    }

    @PostMapping("/validar")
    public ResponseEntity<List<ClienteDTO>> validarClientes(
            @RequestBody List<@Valid ClienteDTO> clientes) {
        return ResponseEntity.ok(service.validarEPreparar(clientes));
    }

    @PostMapping("/analisar")
    public ResponseEntity<Map<String, Object>> analisarClientes(
            @Valid @RequestBody ProcessamentoClientesDTO pedido) {
        List<ClienteDTO> preparados = service.validarEPreparar(pedido.linhas());
        Map<String, Object> resultadoPython = pythonEtlService.processar(
                pedido.arquivoNome(), pedido.recebidas(), preparados);
        Map<String, Object> resposta = new LinkedHashMap<>();
        resposta.put("clientes", preparados);
        resposta.put("loteId", resultadoPython.get("loteId"));
        resposta.put("estatisticas", resultadoPython.get("estatisticas"));
        resposta.put("rejeitadas", resultadoPython.get("rejeitadas"));
        return ResponseEntity.ok(resposta);
    }
}
