package br.com.cti.insights.exception;

public class ConsultorNaoEncontradoException extends RuntimeException {
    public ConsultorNaoEncontradoException(Long id) {
        super("Consultor " + id + " não encontrado.");
    }
}
