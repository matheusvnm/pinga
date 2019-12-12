package com.unipampa.sistemaacg.models;

import java.util.Date;

import javax.persistence.*;
import javax.validation.constraints.NotNull;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Entity
@Data
public class AvaliacaoSolicitacao{

	@Id
	@NotNull
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long idAvaliacao;

    private String justificativa;//obrigatório if indeferido

	@JsonFormat(pattern="yyyy-MM-dd")
	private Date dataAvaliacao;//atual

	private long cargaHorariaAtribuida;//obrigatório if deferido

	@OneToOne
	@JoinColumn(name="id_solicitacao", unique=true)
	@JsonBackReference
	@NotNull
	private Solicitacao solicitacao;
	
	@ManyToOne
	private Atividade novaAtividade;

	public AvaliacaoSolicitacao(){}

	public void verificaDeferimento() throws Exception {
		if(this.solicitacao.getStatus().equalsIgnoreCase("DEFERIDO")){
			if(this.cargaHorariaAtribuida <= 0){
				throw new Exception("É necessário atribuir carga horária quando a solicitação é deferida");
			}
		}else if(this.solicitacao.getStatus().equalsIgnoreCase("INDEFERIDO")){
			if(this.justificativa == null || this.justificativa.isEmpty()){
				throw new Exception("É necessário informar a justificativa do indeferimento");
			}
		}

	}

}
