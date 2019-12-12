package com.unipampa.sistemaacg.controllers;

import java.text.SimpleDateFormat;
import java.util.*;

import javax.validation.Valid;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.unipampa.sistemaacg.dto.InfosSolicitacaoDTO;
import com.unipampa.sistemaacg.dto.SolicitacaoPostDTO;
import com.unipampa.sistemaacg.models.Anexo;
import com.unipampa.sistemaacg.models.Atividade;
import com.unipampa.sistemaacg.models.Solicitacao;
import com.unipampa.sistemaacg.models.Status;
import com.unipampa.sistemaacg.repository.AnexoRepository;
import com.unipampa.sistemaacg.repository.AtividadeRepository;
import com.unipampa.sistemaacg.repository.CurriculoRepository;
import com.unipampa.sistemaacg.repository.DocsRepository;
import com.unipampa.sistemaacg.repository.GrupoRepository;
import com.unipampa.sistemaacg.repository.SolicitacaoRepository;
import com.unipampa.sistemaacg.storageanexo.StorageService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * SolicitacaoController
 */
@SuppressWarnings("ALL")
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("solicitacao") // localhost:8080/solicitacao
public class SolicitacaoController {

    @Autowired
    AnexoRepository anexoRepository;
    @Autowired
    SolicitacaoRepository solicitacaoRepository;
    @Autowired
    AtividadeRepository atividadeRepository;
    @Autowired
    GrupoRepository grupoRepository;
    @Autowired
    CurriculoRepository curriculoRepository;
    @Autowired
    DocsRepository docsRepository;


    private static final Logger logger = LoggerFactory.getLogger(SolicitacaoController.class);

    private final StorageService storageService;

    @Autowired
    public SolicitacaoController(final StorageService storageService) {
        this.storageService = storageService;
    }

    /**
     * Pega todas as solicitações no banco.
     * @return Retorna todas as solicitações em formato JSON.
     */
    @GetMapping(value = "")
    public @ResponseBody
    ResponseEntity<Iterable<Solicitacao>> getSolitacoes() {
        Iterable<Solicitacao> retornableSolicitacoes = solicitacaoRepository.findAll();
        return ResponseEntity.ok(retornableSolicitacoes);
    }

    /**
     * Retorna as informações dos Grupos, Atividades e Documentos Necessários.
     * @return Todas as informações em um formato JSON.
     */
    @GetMapping(value = "/infos")
    public InfosSolicitacaoDTO getInfos() {

        InfosSolicitacaoDTO infos = new InfosSolicitacaoDTO();
        infos.setAtividades(atividadeRepository.findAll());
        infos.setDocsNecessarios(docsRepository.findAll());
        infos.setCurriculo(curriculoRepository.findAll());
        infos.setGrupos(grupoRepository.findAll());

        return infos;
    }


    /**
     * Método de retorno de uma solicitação especifica, buscada pelo seu ID.
     * @param id
     * @return Retorna a solicitação selecionada.
     */
    @GetMapping(value = "/{id}")
    public @ResponseBody
    ResponseEntity<Optional<Solicitacao>> getSolicitacaobyId(@PathVariable long id) {
        final Optional<Solicitacao> retornableSolicitacao = solicitacaoRepository.findById(id);
        return ResponseEntity.ok(retornableSolicitacao);
    }


    /**
     * Método de salvamento de solicitação de ACG. Serve para inclusão no banco das informações da solicitação ACG,
     * bem como seus anexos e a atividade/grupo escolhida.
     * @param solicitacao
     * @param files
     * @return Retorna um OK caso a operação seja efetuada com sucesso. Em caso de erro retorna um error.
     * @throws Exception
     */
    @JsonIgnore
    @PostMapping("/")
    public ResponseEntity postSolicitacao(@Valid @ModelAttribute SolicitacaoPostDTO solicitacao, @RequestParam("file") MultipartFile files[]) throws Exception {

        Optional<Atividade> atividade = atividadeRepository.findById(solicitacao.getIdAtividade());

        if (!atividade.isPresent()) {
            return ResponseEntity.badRequest().body("A Atividade com o ID " + solicitacao.getIdAtividade() + " não foi encontrada");
        }
        if (files.length < atividade.get().getDocs().size()){
            return ResponseEntity.badRequest().body("Você precisa anexar todos os comprovantes");
        }

        Solicitacao newSolicitacao = new Solicitacao();
        if(atividade.get().isPrecisaCalcular()){
            newSolicitacao.setCargaHorariaSoli(solicitacao.getCargaHorariaRealizada()*atividade.get().getCh());
        } else {
            newSolicitacao.setCargaHorariaSoli(atividade.get().getCh());
        }
        newSolicitacao.setCargaHorariaRealizada(solicitacao.getCargaHorariaRealizada());


        newSolicitacao.setAtividade(atividade.get());
        newSolicitacao.setNomeAluno(solicitacao.getAluno());
        newSolicitacao.setMatricula(solicitacao.getMatricula());
        newSolicitacao.setDescricao(solicitacao.getDescricao());
        newSolicitacao.setLocal(solicitacao.getLocal());
        newSolicitacao.setProfRes(solicitacao.getProfRes());

        Date dataAtual = new Date();
        SimpleDateFormat formato = new SimpleDateFormat("yyyy-MM-dd", Locale.ENGLISH);
        newSolicitacao.setDataAtual(dataAtual);
        Date dataInicio = formato.parse(solicitacao.getDataInicio());
        Date dataFim = formato.parse(solicitacao.getDataFim());
        newSolicitacao.setDataInicio(dataInicio);
        newSolicitacao.setDataFim(dataFim);

        newSolicitacao.setStatus(Status.PENDENTE.toString());
        Solicitacao retornableSolicitacao = solicitacaoRepository.save(newSolicitacao);


        for (int j = 0; j < files.length; j++) {
            Anexo newAnexo = new Anexo();
            newAnexo.setNome(storageService.store(files[j], solicitacao.getMatricula(), retornableSolicitacao.getIdSolicitacao()));
            newAnexo.setDoc(atividade.get().getDocs().get(j));
            newAnexo.setSolicitacao(retornableSolicitacao);
            anexoRepository.save(newAnexo);
        }

        return ResponseEntity.ok(retornableSolicitacao);

    }

    /**
     * Deleta a solicitação escolhida
     * @param id
     * @return Retorna um OK caso a seja deletado com sucesso. Em caso de erro retorna um error.
     */
    @DeleteMapping(value = "/{id}")
    public @ResponseBody
    ResponseEntity deleteSolicitacaobyId(@PathVariable long id) {
        // Busca no banco pelo id
        Optional<Solicitacao> retornableSolicitacao = solicitacaoRepository.findById(id);
        if(retornableSolicitacao.get().getStatus().equalsIgnoreCase("PENDENTE")){
            solicitacaoRepository.deleteById(id);
            return ResponseEntity.ok("Solicitação apagada com sucesso!");
        }
        return ResponseEntity.ok("Não é possível deletar a solicitação pois seu status é " + retornableSolicitacao.get().getStatus());
    }


}

