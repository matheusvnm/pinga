package com.unipampa.sistemaacg.controllers;

import java.util.Date;
import java.util.Optional;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unipampa.sistemaacg.dto.AvaliacaoDTO;
import com.unipampa.sistemaacg.models.AvaliacaoSolicitacao;
import com.unipampa.sistemaacg.models.Solicitacao;
import com.unipampa.sistemaacg.models.Status;
import com.unipampa.sistemaacg.repository.AnexoRepository;
import com.unipampa.sistemaacg.repository.AtividadeRepository;
import com.unipampa.sistemaacg.repository.AvaliacaoRepository;
import com.unipampa.sistemaacg.repository.CurriculoRepository;
import com.unipampa.sistemaacg.repository.GrupoRepository;
import com.unipampa.sistemaacg.repository.SolicitacaoRepository;
import com.unipampa.sistemaacg.storageanexo.StorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * AvaliacaoController
 */
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("avaliacao")
public class AvaliacaoController {

    @Autowired
    SolicitacaoRepository solicitacaoRepository;
    @Autowired
    AtividadeRepository atividadeRepository;
    @Autowired
    GrupoRepository grupoRepository;
    @Autowired
    CurriculoRepository curriculoRepository;
    @Autowired
    AvaliacaoRepository avaliacaoRepository;
    @Autowired
    AnexoRepository anexoRepository;

    private final StorageService storageService;

    @Autowired
    public AvaliacaoController(StorageService storageService) {
        this.storageService = storageService;
    }


    /**
     * Metodo de salvamento da avaliação. Serve para como inclusão da avaliação de uma solicitação no banco de dados.
     * @param avaliacao
     * @param id
     * @return Retorna um Ok em caso de sucesso. Em caso de erro retorna um error.
     */

    @JsonIgnore
    @PostMapping("/{id}")
    public ResponseEntity postAvaliacao(@RequestBody AvaliacaoDTO avaliacao, @PathVariable long id) {

        AvaliacaoSolicitacao newAvaliacao = new AvaliacaoSolicitacao();
        Date dataAtual = new Date();
        Optional< Solicitacao> avaliada = solicitacaoRepository.findById(id);
        if(!avaliada.isPresent()){
            return ResponseEntity.badRequest().body("A solicitação com ID "+id+" não foi encontrada");
        }
        Solicitacao solicitacaoAvaliada = avaliada.get();
        String status = solicitacaoAvaliada.getStatus();
        if (status.equals("Deferido") || status.equals("Indeferido")) {
            return ResponseEntity.badRequest().body("Essa avaliação da foi avaliada");
        }
        if (avaliacao.isDeferido()) {
            solicitacaoAvaliada.setStatus(Status.DEFERIDO.toString());
            if(atividadeRepository.findById(avaliacao.getIdAtividade()).isPresent())
                newAvaliacao.setNovaAtividade(atividadeRepository.findById(avaliacao.getIdAtividade()).get());
            newAvaliacao.setCargaHorariaAtribuida(avaliacao.getCargaHorariaAtribuida());
        } else {
            solicitacaoAvaliada.setStatus(Status.INDEFERIDO.toString());
        }
        solicitacaoRepository.save(solicitacaoAvaliada);
        newAvaliacao.setDataAvaliacao(dataAtual);
        newAvaliacao.setSolicitacao(solicitacaoAvaliada);

        newAvaliacao.setJustificativa(avaliacao.getParecer());
        try {
            newAvaliacao.verificaDeferimento();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Não foi possível realizar a avaliação, pois: " + e.getMessage());

        }
        AvaliacaoSolicitacao retornableAvaliacao = avaliacaoRepository.save(newAvaliacao);

        return ResponseEntity.ok(retornableAvaliacao);
    }

    /**
     * Deleta a avaliação escolhida.
     * @param id
     * @return Retorna um OK caso a seja deletado com sucesso. Em caso de erro retorna um error.
     */
    @DeleteMapping(value = "/{id}")
    public @ResponseBody
    ResponseEntity<Optional<AvaliacaoSolicitacao>> deleteAvaliacaobyId(@PathVariable long id) {

        Optional<AvaliacaoSolicitacao> retornableAvaliacao = avaliacaoRepository.findById(id);
        avaliacaoRepository.deleteById(id);
        retornableAvaliacao.get().getSolicitacao().setStatus(Status.PENDENTE.toString());
        solicitacaoRepository.save(retornableAvaliacao.get().getSolicitacao());
        return ResponseEntity.ok(retornableAvaliacao);
    }

    /**
     * Busca no banco pelo id
     * @param id
     * @return Retorna as informações da solicitacão em caso de sucesso. Em caso de erro retorna um error.
     */
    @GetMapping(value = "/infos/{id}") // get infos para avaliacao
    public ResponseEntity<Optional<Solicitacao>> getInfos(@PathVariable long id) {
        Optional<Solicitacao> retornableSolicitacao = solicitacaoRepository.findById(id);
        return ResponseEntity.ok(retornableSolicitacao);
    }

    /**
     * Pega um anexo a partir do nome do anexo.
     * @param filename
     * @return
     */
    @GetMapping("/file/{filename:.+}")
    @ResponseBody
    public ResponseEntity<Resource> getFile(@PathVariable String filename) {

        Resource file = storageService.loadAsResource(filename);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }


}