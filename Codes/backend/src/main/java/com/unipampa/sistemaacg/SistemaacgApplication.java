package com.unipampa.sistemaacg;

import com.unipampa.sistemaacg.storageanexo.StorageProperties;
import com.unipampa.sistemaacg.storageanexo.StorageService;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableConfigurationProperties(StorageProperties.class)
public class SistemaacgApplication {

	public static void main(String[] args) {
		SpringApplication.run(SistemaacgApplication.class, args);
	}

	@Bean
    CommandLineRunner init(StorageService storageService) {
        return (args) -> storageService.init();
    }
}
