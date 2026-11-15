package br.com.cti.insights.service;

import br.com.cti.insights.dto.ClienteDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PythonEtlService {
    private final String baseUrl;
    private final String chave;
    private final ObjectMapper json;
    private final HttpClient http = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public PythonEtlService(
            @Value("${api.etl.url:http://localhost:8000}") String baseUrl,
            @Value("${api.etl.key:}") String chave,
            ObjectMapper json) {
        this.baseUrl = baseUrl.replaceAll("/+$", "");
        this.chave = chave;
        this.json = json;
    }

    public Map<String, Object> processar(String nomeArquivo, int recebidas, List<ClienteDTO> clientes) {
        Map<String, Object> pedido = new LinkedHashMap<>();
        pedido.put("arquivoNome", nomeArquivo == null || nomeArquivo.isBlank() ? "planilha" : nomeArquivo);
        pedido.put("recebidas", recebidas);
        pedido.put("invalidas", Math.max(0, recebidas - clientes.size()));
        pedido.put("linhas", clientes);

        try {
            HttpRequest.Builder requisicao = HttpRequest.newBuilder(URI.create(baseUrl + "/etl"))
                    .timeout(Duration.ofMinutes(10))
                    .header("Content-Type", "application/json; charset=utf-8")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(json.writeValueAsBytes(pedido)));
            if (chave != null && !chave.isBlank()) {
                requisicao.header("X-ETL-Key", chave);
            }
            HttpResponse<String> resposta = http.send(
                    requisicao.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (resposta.statusCode() < 200 || resposta.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "O serviço de Ciência de Dados respondeu " + resposta.statusCode() + ".");
            }
            return json.readValue(resposta.body(), new TypeReference<>() { });
        } catch (ResponseStatusException erro) {
            throw erro;
        } catch (IOException erro) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Não foi possível falar com o serviço Python. Inicie a API na porta 8000.", erro);
        } catch (InterruptedException erro) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "A chamada ao serviço Python foi interrompida.", erro);
        }
    }

    public Map<String, Object> obterUltimoLote() {
        try {
            HttpRequest.Builder requisicao = HttpRequest.newBuilder(URI.create(baseUrl + "/lotes/ultimo"))
                    .timeout(Duration.ofSeconds(20)).GET();
            if (chave != null && !chave.isBlank()) {
                requisicao.header("X-ETL-Key", chave);
            }
            HttpResponse<String> resposta = http.send(
                    requisicao.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (resposta.statusCode() == 404) {
                return Map.of();
            }
            if (resposta.statusCode() < 200 || resposta.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "O serviço de Ciência de Dados respondeu " + resposta.statusCode() + ".");
            }
            return json.readValue(resposta.body(), new TypeReference<>() { });
        } catch (ResponseStatusException erro) {
            throw erro;
        } catch (IOException erro) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Não foi possível consultar os lotes no serviço Python.", erro);
        } catch (InterruptedException erro) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "A consulta ao serviço Python foi interrompida.", erro);
        }
    }

    public Map<String, Object> obterLote(Long loteId) {
        return get("/lotes/" + loteId, new TypeReference<>() { });
    }

    public List<Map<String, Object>> listarLotes() {
        return get("/lotes", new TypeReference<>() { });
    }

    private <T> T get(String caminho, TypeReference<T> tipo) {
        try {
            HttpRequest.Builder requisicao = HttpRequest.newBuilder(URI.create(baseUrl + caminho))
                    .timeout(Duration.ofSeconds(20)).GET();
            if (chave != null && !chave.isBlank()) requisicao.header("X-ETL-Key", chave);
            HttpResponse<String> resposta = http.send(
                    requisicao.build(), HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (resposta.statusCode() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lote não encontrado.");
            }
            if (resposta.statusCode() < 200 || resposta.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "O serviço de Ciência de Dados respondeu " + resposta.statusCode() + ".");
            }
            return json.readValue(resposta.body(), tipo);
        } catch (ResponseStatusException erro) {
            throw erro;
        } catch (IOException erro) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Não foi possível consultar o histórico do serviço Python.", erro);
        } catch (InterruptedException erro) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "A consulta ao serviço Python foi interrompida.", erro);
        }
    }
}
