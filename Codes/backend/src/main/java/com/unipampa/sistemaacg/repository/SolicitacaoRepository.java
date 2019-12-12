package com.unipampa.sistemaacg.repository;

import com.unipampa.sistemaacg.models.Solicitacao;

import org.springframework.data.repository.CrudRepository;

/**
 * SolicitacaoRepository
 */
public interface SolicitacaoRepository extends CrudRepository<Solicitacao,Long>{

    //Iterable<Solicitacao> getAll();
    //Solicitacao findByAluno(String aluno);
}