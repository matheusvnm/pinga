package com.unipampa.sistemaacg.models;

import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.ManyToMany;
import javax.persistence.JoinTable;
import javax.persistence.JoinColumn;
import javax.validation.constraints.NotEmpty;
import lombok.Data;

@Entity
@Data
public class Atividade {

	@Id
	@NotEmpty
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private long idAtividade;

	@NotEmpty
	private String detalhamento;

	@NotEmpty
	private String descricao;

	@NotEmpty
	private boolean precisaCalcular;

	@ManyToOne
	private Grupo grupo;


    @ManyToMany
    @JoinTable(name="atividade_has_doc", joinColumns=
    {@JoinColumn(name = "id_atividade") }, inverseJoinColumns =
      {@JoinColumn(name="id_doc_necessario")})
	List<DocsNecessarios> docs;

    private int ch;



}
