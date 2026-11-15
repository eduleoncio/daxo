package br.com.cti.insights.dto;

import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ClienteDTO(
        @NotBlank(message = "O código do cliente é obrigatório")
        @Size(max = 30, message = "O código do cliente deve ter no máximo 30 caracteres")
        String codigoCliente,
        @NotBlank(message = "O nome do cliente é obrigatório")
        @Size(max = 150, message = "O nome do cliente deve ter no máximo 150 caracteres")
        String nomeCliente,
        @NotBlank(message = "O consultor é obrigatório")
        @Size(max = 120, message = "O consultor deve ter no máximo 120 caracteres")
        String consultor,
        @NotBlank(message = "O segmento é obrigatório")
        @Size(max = 100, message = "O segmento deve ter no máximo 100 caracteres")
        String segmento,
        @NotBlank(message = "O nível do cliente é obrigatório")
        @Pattern(regexp = "^[ABCabc]$", message = "O nível deve ser A, B ou C")
        String nivelCliente,
        @NotNull(message = "O faturamento anual é obrigatório")
        @Positive(message = "O faturamento anual deve ser maior que zero")
        Double faturamentoAnual,
        @NotBlank(message = "Os serviços contratados são obrigatórios")
        String servicosContratados,
        @NotNull(message = "A data de contratação é obrigatória")
        LocalDate dataContratacao,
        @Size(max = 100, message = "A cidade deve ter no máximo 100 caracteres")
        String cidade,
        @Pattern(regexp = "^$|^[A-Za-z]{2}$", message = "A UF deve possuir duas letras")
        String uf
) { }
