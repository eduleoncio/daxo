package br.com.cti.insights.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CadastroDTO(
        @NotBlank(message = "Nome é obrigatório.") @Size(max = 100) String nome,
        @NotBlank(message = "E-mail é obrigatório.") @Email(message = "Informe um e-mail válido.") String email,
        @NotBlank(message = "Senha é obrigatória.")
        @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d).{8,72}$", message = "A senha deve ter entre 8 e 72 caracteres, com letra e número.")
        String senha
) { }
