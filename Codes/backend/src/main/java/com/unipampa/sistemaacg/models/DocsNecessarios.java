package com.unipampa.sistemaacg.models;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import lombok.Data;

/**
 * DocsNecessarios
 */
@Entity
@Data
public class DocsNecessarios {

    @Id
	@NotEmpty
	@GeneratedValue(strategy = GenerationType.AUTO)
	private long idDocNecessario;

    @NotNull
    String nome;

}