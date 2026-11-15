package br.com.cti.insights.dto;

import br.com.cti.insights.model.Consultor;

public record ConsultorRespostaDTO(Long id, String nome, String email, String perfil) {
    public static ConsultorRespostaDTO de(Consultor consultor) {
        return new ConsultorRespostaDTO(consultor.getId(), consultor.getNome(), consultor.getEmail(), consultor.getPerfil().name());
    }
}
