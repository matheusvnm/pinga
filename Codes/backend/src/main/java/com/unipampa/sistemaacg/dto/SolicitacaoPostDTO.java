package com.unipampa.sistemaacg.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

/**
 * SolicitacaoPostDTO
 */
@Data
public class SolicitacaoPostDTO {

    private String local;
	private String aluno;
	private long matricula;
	@JsonFormat(pattern="yyyy-MM-dd")
	private String dataInicio;
	@JsonFormat(pattern="yyyy-MM-dd")
	private String dataFim;
	private long cargaHorariaRealizada;
	private long cargaHorariaSoli;
	private String profRes;
	private String descricao;
	private long idAtividade;
}