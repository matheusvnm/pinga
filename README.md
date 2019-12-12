# Portal Institucional de Gerenciamento de ACG (P.IN.G.A)

## Visão geral

A aplicação Portal Institucional de Gerenciamento de ACG (P.IN.G.A) é um sistema cujo o principal objetivo é o gerenciamento de ACGs. Ele foi desenvolvido pelos alunos de Engenharia de Software na disciplina de Resolução de Problemas VI. As principais funcionalidades são descritas nas seguintes histórias de usuário:

**História de Usuário**

HU4: Como discente eu quero solicitar (incluir e excluir) o aproveitamento de ACG's, anexando as comprovações necessárias.

HU2: Como coordenador eu quero avaliar (incluir e excluir) as solicitações de ACG's feitas pelos discentes dos cursos.

HU6: Como coordenador ou discente eu quero consultar as solicitações de ACG's incluindo suas respectivas avaliações

## O Projeto
Este projeto conta com dois subprojetos, um para o front-end feito com ReactJS, e outro para o back-end feito com Spring Boot.


## Executando o projeto


Para executar este sistema, deve-se executar primeiramente o back-end e então o front-end

#### Requisitos

Você deve ter o **JDK8**, o **Maven**, o **NodeJS**, e algum sistema de banco de dados derivado do **MySQL** (recomendado utilizar uma instalação do **XAMPP**) instalados em sua maquina para conseguir executar o sistema

#### Configurando o acesso ao banco
Para configurar o acesso ao banco, abra o arquivo `application.properties` localizado em `/codes/backend/src/main/resources`. Nele, modifique as seguintes linhas, substituindo `<username>` pelo nome de usuário do banco, e `<password>` pela senha de acesso ao banco:
```properties
spring.datasource.username=<username>
spring.datasource.password=<password>
```


#### Executando o back-end

Abra um terminal, va até a pasta ```/codes/backend``` e execute o seguinte comando:

``` bash
mvn spring-boot:run
```

E então o Maven irá instalar as dependências e executar o projeto, criando o banco de dados e sua estrutura.

#### Importando os dados
Após iniciado o o **back-end**, você deve importar os dados para o banco de dados utilizando uma ferramenta de gerencia de banco de dados de sua preferencia (Recomenda-se utilizar o **PhpMyAdmin**, que vem em conjunto com o **XAMPP**). O arquivo com os dados está localizado em `/Artefatos de Engenharia/Projeto/SCRIPT_POPULACAO_BANCO.sql`.

O nome do banco de dados criado pelo Spring é `sistemaacg`, mas você pode modifica-lo alterado a `url` no `application.properties`

#### Executando o front-end

Abra um terminal, va até a pasta ```/codes/frontend``` e execute os seguintes comandos:

* **Usando NPM**

``` bash
npm install
npm start
```

* **Usando Yarn**

``` bash
yarn install
yarn start
```

E então o Node irá instalar as dependências e executar o projeto.

Após tudo inicializado, basta acessar a o endereço `localhost:3000` e utilizar o produto.
