package br.com.cti.insights.controller;

import br.com.cti.insights.service.PythonEtlService;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {
    private final PythonEtlService pythonEtlService;

    public DashboardController(PythonEtlService pythonEtlService) {
        this.pythonEtlService = pythonEtlService;
    }

    @GetMapping
    public Map<String, Object> obterLote(@RequestParam(required = false) Long loteId) {
        return loteId == null ? pythonEtlService.obterUltimoLote() : pythonEtlService.obterLote(loteId);
    }

    @GetMapping("/lotes")
    public List<Map<String, Object>> listarLotes() {
        return pythonEtlService.listarLotes();
    }
}
