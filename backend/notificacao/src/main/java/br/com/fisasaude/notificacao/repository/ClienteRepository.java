package br.com.fisasaude.notificacao.repository;

import br.com.fisasaude.notificacao.model.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Integer> {}
