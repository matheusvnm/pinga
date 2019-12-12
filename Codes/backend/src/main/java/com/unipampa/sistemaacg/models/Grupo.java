package com.unipampa.sistemaacg.models;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import lombok.Data;

@Entity
@Data
public class Grupo {

	@Id
	@NotEmpty
	@GeneratedValue(strategy= GenerationType.IDENTITY)
	private long idGrupo;

	@NotEmpty
	private String nome;

	@ManyToOne
	private Curriculo curriculo;

}
