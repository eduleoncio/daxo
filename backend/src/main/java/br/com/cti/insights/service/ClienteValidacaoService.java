package br.com.cti.insights.service;

import br.com.cti.insights.dto.ClienteDTO;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.text.Normalizer;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class ClienteValidacaoService {

    public List<ClienteDTO> validarEPreparar(List<ClienteDTO> clientes) {
        Set<String> codigos = new HashSet<>();
        for (ClienteDTO cliente : clientes) {
            String codigo = cliente.codigoCliente().trim().toUpperCase(Locale.ROOT);
            if (!codigos.add(codigo)) {
                throw new IllegalArgumentException("Código repetido na planilha: " + codigo);
            }
        }
        return clientes.stream().map(this::padronizar).toList();
    }

    private ClienteDTO padronizar(ClienteDTO cliente) {
        return new ClienteDTO(
                cliente.codigoCliente().trim().toUpperCase(Locale.ROOT),
                cliente.nomeCliente().trim(),
                formatarNome(cliente.consultor()),
                padronizarSegmento(cliente.segmento()),
                cliente.nivelCliente().trim().toUpperCase(Locale.ROOT),
                cliente.faturamentoAnual(),
                cliente.servicosContratados().trim(),
                cliente.dataContratacao(),
                cliente.cidade() == null ? "" : cliente.cidade().trim(),
                cliente.uf() == null ? "" : cliente.uf().trim().toUpperCase(Locale.ROOT)
        );
    }

    private String padronizarSegmento(String segmento) {
        String chave = Normalizer.normalize(segmento.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "");
        return switch (chave) {
            case "ind", "industria", "industrial" -> "Indústria";
            case "com", "comercio" -> "Comércio";
            case "serv", "servico", "servicos" -> "Serviços";
            case "saude" -> "Saúde";
            case "edu", "educacao" -> "Educação";
            case "tec", "ti", "tecnologia" -> "Tecnologia";
            default -> segmento.trim();
        };
    }

    private String formatarNome(String nome) {
        String[] palavras = nome.trim().toLowerCase(Locale.ROOT).split("\\s+");
        Set<String> particulas = Set.of("de", "da", "do", "das", "dos", "e");
        for (int i = 0; i < palavras.length; i++) {
            if (i > 0 && particulas.contains(palavras[i])) continue;
            palavras[i] = palavras[i].substring(0, 1).toUpperCase(Locale.ROOT) + palavras[i].substring(1);
        }
        return String.join(" ", palavras);
    }
}
