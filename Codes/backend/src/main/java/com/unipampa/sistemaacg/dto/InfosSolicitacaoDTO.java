package com.unipampa.sistemaacg.dto;

import com.unipampa.sistemaacg.models.Atividade;
import com.unipampa.sistemaacg.models.Curriculo;
import com.unipampa.sistemaacg.models.DocsNecessarios;
import com.unipampa.sistemaacg.models.Grupo;

import lombok.Data;

/**
 * InfosSolicitacaoDTO
 */
@Data
public class InfosSolicitacaoDTO {
    Iterable<Atividade> atividades;
    Iterable<Grupo> grupos;
    Iterable<Curriculo> curriculo;
    Iterable<DocsNecessarios> docsNecessarios;


    public InfosSolicitacaoDTO(){}
}