package com.unipampa.sistemaacg.storageanexo;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileSystemUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StorageAnexo implements StorageService {

    private final Path rootLocation;
    private static long numberinstance = 0;
    private final Logger logger = LoggerFactory.getLogger(StorageAnexo.class);
    @Autowired
    public StorageAnexo(StorageProperties properties) {
        this.rootLocation = Paths.get(properties.getLocation());
    }

    /**
     * Método de salvamento de anexos individualmente em uma pasta local
     * @param file
     * @param matricula
     * @param idSolicitacao
     * @return Retorna o nome do anexo, para ser armazenado em algum outro local (BD, Arquivo do Sistema ou TXT).
     */
    @Override
    public String store(MultipartFile file, long matricula, long idSolicitacao) {
        String originalfilename = matricula + "_" + idSolicitacao + "_" + (numberinstance++) + "_"
                + file.getOriginalFilename();
        Path filename = this.rootLocation.resolve(originalfilename);
        try {
            if (file.isEmpty()) {
                throw new StorageException("Falha ao salvar arquivo vazio" + file.getOriginalFilename());
            }
            Files.copy(file.getInputStream(), filename);
        } catch (IOException e) {
            throw new StorageException("Falha ao armazenar " + file.getOriginalFilename(), e);
        }

        return originalfilename;
    }

    @Override
    public Stream<Path> loadAll() {
        try {
            return Files.walk(this.rootLocation, 1).filter(path -> !path.equals(this.rootLocation))
                    .map(this.rootLocation::relativize);
        } catch (IOException e) {
            throw new StorageException("Falha ao ler arquivos salvos", e);
        }

    }

    @Override
    public Path load(String filename) {
        return rootLocation.resolve(filename);
    }

    @Override
    public Resource loadAsResource(String filename) {
        try {
            Path file = load(filename);
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new StorageException("Não foi possível ler este arquivo: " + filename);

            }
        } catch (MalformedURLException e) {
            throw new StorageException("Não foi possível ler este arquivo: " + filename, e);
        }
    }

    @Override
    public void deleteAll() {
        FileSystemUtils.deleteRecursively(rootLocation.toFile());
    }

    @Override
    public void init() {
        try {

            Files.createDirectory(rootLocation);
        } catch (IOException e) {
            logger.info("Diretório upload-dir já existente, não existe a necessidade de cria-lo");
        }
    }
}