package br.com.cti.insights.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;

public record ProcessamentoClientesDTO(
        String arquivoNome,
        @NotNull(message = "O total de linhas recebidas é obrigatório")
        @PositiveOrZero(message = "O total de linhas não pode ser negativo")
        Integer recebidas,
        @NotEmpty(message = "Envie pelo menos um cliente válido")
        List<@Valid ClienteDTO> linhas
) { }
