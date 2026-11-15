package br.com.cti.insights.repository;

import br.com.cti.insights.model.Consultor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConsultorRepository extends JpaRepository<Consultor, Long> {

    Optional<Consultor> findByEmail(String email);

    Optional<Consultor> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);
}
