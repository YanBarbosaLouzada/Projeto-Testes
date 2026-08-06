# Documentação do Projeto Mynds

> Documentação completa e didática do projeto **Mynds**: o que ele é, como está organizado, quais ferramentas usa e como colocá-lo para rodar do zero. Escrita para que qualquer pessoa — mesmo sem ter participado do desenvolvimento — consiga entender e rodar o projeto.

---

## Sumário

1. [O que é o Mynds](#1-o-que-é-o-mynds)
2. [Arquitetura geral](#2-arquitetura-geral)
3. [Estrutura de pastas](#3-estrutura-de-pastas)
4. [Tecnologias utilizadas](#4-tecnologias-utilizadas)
5. [Pré-requisitos](#5-pré-requisitos)
6. [Como clonar o projeto](#6-como-clonar-o-projeto)
7. [Configurando as variáveis de ambiente](#7-configurando-as-variáveis-de-ambiente)
8. [Instalando as dependências](#8-instalando-as-dependências)
9. [Rodando o projeto em desenvolvimento](#9-rodando-o-projeto-em-desenvolvimento)
10. [Funcionalidades do sistema](#10-funcionalidades-do-sistema)
11. [Documentação da API (Backend)](#11-documentação-da-api-backend)
12. [Modelos de dados (banco de dados)](#12-modelos-de-dados-banco-de-dados)
13. [Autenticação (como o login funciona)](#13-autenticação-como-o-login-funciona)
14. [Chat em tempo real (Socket.io)](#14-chat-em-tempo-real-socketio)
15. [Mapa de telas do Frontend](#15-mapa-de-telas-do-frontend)
16. [Scripts disponíveis](#16-scripts-disponíveis)
17. [Padrões de código e Lint](#17-padrões-de-código-e-lint)
18. [Problemas comuns (Troubleshooting)](#18-problemas-comuns-troubleshooting)
19. [Testes automatizados](#19-testes-automatizados)
20. [Possíveis próximos passos](#20-possíveis-próximos-passos)

---

## 1. O que é o Mynds

O **Mynds** é um sistema web full-stack de **catálogo de produtos**, com:

- Cadastro e login de usuários (autenticação via token JWT);
- Cadastro, edição, exclusão e listagem de produtos, organizados por categoria (Masculino, Feminino, Outros);
- Um chat de suporte em tempo real, usando WebSockets (Socket.io);
- Interface web (SPA) construída em React.

É um projeto **didático**, pensado para servir de base tanto para aprender desenvolvimento full-stack quanto para praticar testes de software (veja a [Apostila de Testes](./APOSTILA-TESTES.md)).

---

## 2. Arquitetura geral

O projeto é dividido em **duas aplicações independentes**, que rodam em processos e portas separadas e conversam entre si por HTTP e WebSocket:

```
┌─────────────────────────┐        HTTP (REST API)        ┌──────────────────────────┐
│         Frontend         │ ─────────────────────────────▶│          Backend          │
│  React + Vite            │◀───────────────────────────── │  Node.js + Express        │
│  http://localhost:5173   │        JSON (produtos,        │  http://localhost:4444    │
│                           │        login, cadastro)       │                            │
│                           │                                │                            │
│                           │        WebSocket (chat)        │  Socket.io                │
│                           │◀──────────────────────────────▶│  http://localhost:8080    │
└─────────────────────────┘                                └────────────┬─────────────┘
                                                                          │
                                                                          │ Mongoose (ODM)
                                                                          ▼
                                                              ┌──────────────────────────┐
                                                              │   MongoDB (Atlas/nuvem)   │
                                                              └──────────────────────────┘
```

- O **Frontend** é uma *Single Page Application* (SPA): o navegador carrega uma única página HTML e o React troca o conteúdo dinamicamente, sem recarregar a página, usando o React Router.
- O **Backend** expõe uma **API REST** (endpoints HTTP que recebem/retornam JSON) e, separadamente, um **servidor de WebSocket** (Socket.io) só para o chat.
- O banco de dados é o **MongoDB**, um banco não-relacional (documentos em formato parecido com JSON), acessado através da biblioteca **Mongoose**.

> **Por que duas portas diferentes no Backend (4444 e 8080)?** O código atual sobe o Express (API REST) na porta `4444` e o servidor de Socket.io na porta `8080`, dentro do mesmo arquivo (`Backend/src/index.js`). São dois servidores HTTP distintos rodando ao mesmo tempo no mesmo processo Node.

---

## 3. Estrutura de pastas

```
Segunda/                          ← pasta raiz do projeto (workspace)
├── APOSTILA-TESTES.md            ← material didático de testes (16 aulas)
├── DOCUMENTACAO.md               ← este documento
│
├── Backend/                      ← API REST + servidor de chat
│   ├── .env                      ← variáveis de ambiente (NÃO vai para o Git)
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── index.js              ← ponto de entrada: cria o Express, o Socket.io e conecta o banco
│       ├── config/
│       │   └── database.js       ← conexão com o MongoDB via Mongoose
│       ├── controller/           ← regras de negócio de cada recurso
│       │   ├── UserController.js       ← login, registro, validação de token
│       │   ├── ProductController.js    ← CRUD de produtos
│       │   ├── cadastro.js             ← controller de exemplo/didático (não usado nas rotas ativas)
│       │   └── primeiroController.js   ← controller de exemplo ("Olá mundo")
│       ├── router/               ← liga cada rota HTTP a um método do controller
│       │   ├── UserRouter.js
│       │   ├── ProductRouter.js
│       │   ├── cadastro.js
│       │   └── primeiroRouter.js
│       ├── models/                ← schemas do Mongoose (formato dos documentos no MongoDB)
│       │   ├── user.js
│       │   └── product.js
│       ├── functions/             ← funções soltas de exemplo (soma, hello, ola)
│       └── public/                ← arquivos estáticos servidos pelo Express
│
└── Frontend/                     ← aplicação React (SPA)
    ├── index.html                ← HTML raiz, onde o React é injetado
    ├── vite.config.js            ← configuração do Vite (bundler/dev server)
    ├── package.json
    └── src/
        ├── main.jsx               ← ponto de entrada: monta o React no <div id="root">
        ├── App.jsx                ← componente raiz, injeta o roteador
        ├── router.jsx              ← definição das rotas (React Router)
        ├── index.css               ← variáveis de tema (cores, fontes) usadas no projeto inteiro
        ├── App.css
        ├── pages/                  ← telas completas (uma por rota)
        │   ├── Layout/                → moldura fixa (Navbar + conteúdo da rota atual)
        │   ├── HomePage/               → página inicial
        │   ├── AuthPage/               → tela de login/registro
        │   ├── ProductPage/            → catálogo de produtos
        │   └── ChatPage/               → tela do chat de suporte
        ├── components/             ← peças reutilizáveis de UI
        │   ├── Product/                → card de um produto
        │   ├── CategoryCard/           → card de uma categoria (filtro)
        │   ├── Modal/                  → janela modal genérica
        │   ├── Form/                   → formulário de criar/editar produto
        │   ├── LoginForm/               → formulário de login
        │   ├── RegisterForm/            → formulário de registro
        │   ├── Chat/                    → janela de mensagens do chat
        │   ├── Join/                    → tela de "escolher um nome" antes do chat
        │   └── UI/
        │       ├── Navbar/                → barra de navegação superior
        │       └── AddNewButton/          → botão flutuante "+"
        └── fn-helpers/              ← funções utilitárias puras
            ├── FormatDate.jsx          → formata datas para o padrão brasileiro
            └── categories.jsx          → metadados das categorias de produto (ícone, cor, rótulo)
```

---

## 4. Tecnologias utilizadas

### Backend (`Backend/`)

| Tecnologia | Versão (aprox.) | Para que serve |
|---|---|---|
| [Node.js](https://nodejs.org/) | 22.x | Ambiente de execução do JavaScript no servidor |
| [Express](https://expressjs.com/) | ^5.2 | Framework web — define rotas HTTP e middlewares |
| [Mongoose](https://mongoosejs.com/) | ^9.2 | ODM (Object-Document Mapper) para o MongoDB — define schemas/models |
| [MongoDB](https://www.mongodb.com/) | ^7 (driver) | Banco de dados NoSQL orientado a documentos |
| [Socket.io](https://socket.io/) | ^4.8 | Comunicação em tempo real (WebSocket) — usado no chat |
| [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken) | ^9 | Geração e verificação de tokens de autenticação |
| [bcrypt](https://www.npmjs.com/package/bcrypt) | ^6 | Hash (criptografia unidirecional) de senhas |
| [cors](https://www.npmjs.com/package/cors) | ^2.8 | Libera requisições vindas de outra origem (o Frontend, em outra porta) |
| [dotenv](https://www.npmjs.com/package/dotenv) | ^17 | Carrega variáveis de ambiente do arquivo `.env` |
| [nodemon](https://www.npmjs.com/package/nodemon) | ^3.1 | Reinicia o servidor automaticamente a cada alteração de código (dev) |

> O Backend usa **ES Modules** nativos (`"type": "module"` no `package.json`) — ou seja, `import`/`export`, não `require`.

### Frontend (`Frontend/`)

| Tecnologia | Versão (aprox.) | Para que serve |
|---|---|---|
| [React](https://react.dev/) | ^19.2 | Biblioteca para construir a interface, baseada em componentes |
| [Vite](https://vitejs.dev/) | ^8 | Bundler e servidor de desenvolvimento (extremamente rápido) |
| [React Router](https://reactrouter.com/) | ^7.14 | Roteamento client-side (define as URLs/telas da SPA) |
| [Axios](https://axios-http.com/) | ^1.14 | Cliente HTTP para consumir a API do Backend |
| [Socket.io Client](https://socket.io/docs/v4/client-api/) | ^4.8 | Conecta o navegador ao servidor de WebSocket do chat |
| [React Icons](https://react-icons.github.io/react-icons/) | ^5.6 | Biblioteca de ícones SVG prontos (editar, excluir, etc.) |
| [ESLint](https://eslint.org/) | ^9 | Ferramenta de análise estática — aponta erros e más práticas no código |

---

## 5. Pré-requisitos

Antes de começar, é preciso ter instalado na máquina:

- **[Node.js](https://nodejs.org/) versão 18 ou superior** (o projeto foi desenvolvido com a versão 22). O Node já vem com o `npm` (gerenciador de pacotes).
- **[Git](https://git-scm.com/)**, para clonar o repositório.
- Um **editor de código**, recomendado o [VS Code](https://code.visualstudio.com/).
- Uma **conta e um cluster no [MongoDB Atlas](https://www.mongodb.com/atlas)** (gratuito) — ou uma instância local do MongoDB, se preferir rodar o banco na própria máquina.

Para conferir se o Node e o npm estão instalados, rode no terminal:

```bash
node --version
npm --version
```

---

## 6. Como clonar o projeto

```bash
git clone <URL-do-repositório>
cd Segunda
```

> Repare que este workspace contém **dois repositórios Git independentes**: um dentro de `Backend/` e outro dentro de `Frontend/`. Isso significa que, historicamente, cada parte foi versionada separadamente. Ao clonar, confirme com quem mantém o projeto qual é a URL correta de cada repositório (pode ser necessário clonar `Backend` e `Frontend` cada um com seu próprio `git clone`, dentro da pasta `Segunda/`).

---

## 7. Configurando as variáveis de ambiente

O Backend depende de um arquivo `Backend/.env`, que **não é versionado no Git** (está listado no `.gitignore` por segurança — ele guarda segredos). Você precisa criá-lo manualmente.

Crie o arquivo `Backend/.env` com o seguinte conteúdo, substituindo pelos seus próprios valores:

```env
dbUrl = "mongodb+srv://<usuario>:<senha>@<seu-cluster>.mongodb.net/?appName=<nome-da-app>"
PORT = 4444

JWT_SECRET = "escolha-uma-chave-secreta-forte-aqui"
```

| Variável | O que é | Onde conseguir |
|---|---|---|
| `dbUrl` | String de conexão do MongoDB | No painel do MongoDB Atlas: **Connect → Drivers**, copie a *connection string* e troque `<usuario>`/`<senha>` pelos dados do seu banco |
| `PORT` | Porta em que a API HTTP (Express) vai escutar | Pode manter `4444` (é a porta que o Frontend já espera, veja a seção 9) |
| `JWT_SECRET` | Chave secreta usada para assinar e validar os tokens de login | Qualquer string longa e aleatória. **Nunca** compartilhe ou suba essa chave para o Git em produção |

> ⚠️ **Atenção de segurança**: o `.env` de exemplo encontrado durante o desenvolvimento deste projeto continha uma senha de banco e um `JWT_SECRET` fracos (`JWT_SECRET = 1`), usados apenas em ambiente local de estudo. Em qualquer ambiente real (produção), troque essas credenciais e use um `JWT_SECRET` longo e aleatório (por exemplo, gerado com `openssl rand -hex 32`).

O Frontend, por padrão, não precisa de arquivo `.env` — ele já assume que a API está em `http://localhost:4444` e o chat em `http://localhost:8080` (essas URLs estão escritas diretamente no código, nas páginas `AuthPage.jsx`, `ProductPage.jsx` e `Join.jsx`).

---

## 8. Instalando as dependências

As duas aplicações têm dependências (`node_modules`) separadas. Instale cada uma dentro da sua própria pasta:

```bash
# Backend
cd Backend
npm install

# Frontend (em outro terminal, ou depois de voltar para a pasta raiz)
cd ../Frontend
npm install
```

Isso vai ler o `package.json` de cada pasta e baixar todas as bibliotecas listadas na tabela da seção 4.

---

## 9. Rodando o projeto em desenvolvimento

Abra **dois terminais** (um para cada aplicação):

**Terminal 1 — Backend:**

```bash
cd Backend
npm run dev
```

Se tudo estiver certo, você verá no console algo como:

```
Servidor socket rodando na porta 8080
Servidor rodando na porta 4444
Conectado com o mongoDB
```

**Terminal 2 — Frontend:**

```bash
cd Frontend
npm run dev
```

O Vite vai imprimir a URL local, normalmente:

```
Local:   http://localhost:5173/
```

Abra essa URL no navegador. A partir daí, o Frontend já consegue conversar com o Backend (que precisa continuar rodando no Terminal 1).

> **Ordem importa?** É recomendado subir o Backend primeiro. Se o Frontend for aberto antes, não tem problema — ele só vai mostrar erros de rede no console até o Backend também estar de pé (as chamadas de API vão falhar e cair no `catch` de cada requisição).

---

## 10. Funcionalidades do sistema

### 10.1 Autenticação
- **Registro** de novo usuário (nome, idade, e-mail, senha, confirmação de senha).
- **Login** com e-mail e senha, recebendo um token JWT salvo no `localStorage` do navegador.
- **Logout**, que remove o token salvo.
- A Navbar muda automaticamente entre "Login" e "Sair" conforme existe ou não um token salvo.

### 10.2 Catálogo de produtos
- Listagem de todos os produtos cadastrados (rota pública, não exige login).
- Filtro por categoria através de **cards de categoria** (Todos, Masculino, Feminino, Outros), cada um mostrando a contagem de produtos daquele tipo.
- Cadastro de novo produto (exige estar logado) — nome, marca, cor, descrição, preço, categoria, data de lançamento e URL de imagem opcional.
- Edição e exclusão de produtos existentes (exige estar logado).

### 10.3 Chat de suporte
- Botão flutuante "Suporte" leva à tela de chat.
- O usuário escolhe um nome de exibição antes de entrar na conversa.
- Mensagens são enviadas e recebidas em tempo real via WebSocket — qualquer pessoa conectada ao chat ao mesmo tempo vê as mensagens de todos.

---

## 11. Documentação da API (Backend)

Base URL em desenvolvimento: `http://localhost:4444`

### 11.1 Autenticação — `/auth`

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `POST` | `/auth/register` | Não | Cria um novo usuário |
| `POST` | `/auth/login` | Não | Autentica e retorna um token JWT |

**`POST /auth/register`** — corpo da requisição (JSON):

```json
{
  "name": "Aluno Teste",
  "age": 22,
  "email": "aluno@mynds.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

Respostas:
- `200 OK` → `{ "message": "Usuario criado com sucesso!", "data": { ...usuário criado... } }`
- `400 Bad Request` → quando `password` ≠ `confirmPassword`
- `500 Internal Server Error` → erro inesperado (ex: e-mail já existente causando erro no banco, dependendo da configuração)

**`POST /auth/login`** — corpo da requisição:

```json
{
  "email": "aluno@mynds.com",
  "password": "123456"
}
```

Respostas:
- `200 OK` → `{ "token": "<jwt>" }`
- `404 Not Found` → e-mail não cadastrado
- `401 Unauthorized` → senha incorreta

### 11.2 Produtos — `/products`

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/products/` | Não | Lista todos os produtos |
| `POST` | `/products/create-product` | **Sim** | Cria um novo produto |
| `PUT` | `/products/edit-product` | **Sim** | Edita um produto existente |
| `DELETE` | `/products/delete-product/:id` | **Sim** | Remove um produto pelo id |

**`GET /products/`** → `200 OK`:

```json
{
  "products": [
    { "_id": "...", "name": "Camiseta", "mark": "Mynds", "color": "Azul", "price": 59.9, "type": "masculino", "releaseDate": "2026-05-14T00:00:00.000Z" }
  ]
}
```

**`POST /products/create-product`** — exige o header `authorization` com o token (veja a seção 13) e o corpo:

```json
{
  "name": "Camiseta",
  "mark": "Mynds",
  "color": "Azul",
  "description": "Camiseta básica",
  "price": 59.9,
  "imageUrl": "https://exemplo.com/imagem.jpg",
  "type": "masculino"
}
```

**`PUT /products/edit-product`** — mesmo corpo do cadastro, acrescentando o campo `_id` do produto a editar.

**`DELETE /products/delete-product/:id`** — o `id` do produto vai na própria URL.

### 11.3 Rotas de exemplo/didáticas (não ativas)

O código-fonte também contém dois conjuntos de rotas de exemplo, usados como material de estudo, que **não estão conectados** ao `Backend/src/index.js` atualmente (ou seja, não respondem a nenhuma requisição, mesmo com o servidor rodando):

- `router/primeiroRouter.js` + `controller/primeiroController.js` — uma rota `GET /olamundo`, o exemplo mais simples possível de rota Express.
- `router/cadastro.js` + `controller/cadastro.js` — um CRUD de usuário "de brinquedo", que apenas devolve mensagens fixas, sem tocar o banco de dados.

Para ativá-las (por exemplo, em uma aula sobre Express), basta importar e registrar em `Backend/src/index.js`, do mesmo jeito que `productRouter` e `userRouter` já estão:

```js
import primeiroRouter from './router/primeiroRouter.js';
// ...
app.use('/exemplo', primeiroRouter);
```

---

## 12. Modelos de dados (banco de dados)

### 12.1 `User` (coleção `users`)

```js
{
  role: String,       // default: "user"
  name: String,
  age: Number,
  email: String,
  password: String,   // sempre armazenada como HASH (bcrypt), nunca em texto puro
  created_at: Date,   // default: data de criação
}
```

### 12.2 `Product` (coleção `products`)

```js
{
  name: String,
  mark: String,
  color: String,
  description: String,
  price: Number,
  imageUrl: String,
  type: String,        // um dos valores: "masculino" | "feminino" | "outros"
  releaseDate: Date,   // default: data de criação
}
```

---

## 13. Autenticação (como o login funciona)

1. O usuário se registra (`POST /auth/register`) — a senha é transformada em um **hash** com `bcrypt` antes de ser salva (isso significa que nem o próprio banco de dados guarda a senha original — só é possível *comparar* uma senha digitada com o hash salvo, nunca "descriptografar" de volta).
2. O usuário faz login (`POST /auth/login`) — o Backend confere a senha com `bcrypt.compare` e, se estiver certa, gera um **token JWT** assinado com a chave `JWT_SECRET`, válido por 1 hora.
3. O Frontend guarda esse token no `localStorage` do navegador (`AuthPage.jsx`).
4. Em toda requisição que precisa de login (criar/editar/excluir produto), o Frontend envia o token no **header HTTP `authorization`**.
5. O Backend usa o middleware `UserController.authenticateToken` para conferir esse token antes de deixar a requisição chegar ao controller de produtos.

> **Detalhe importante para quem for integrar com este Backend**: diferente do padrão mais comum na web (`Authorization: Bearer <token>`), este projeto envia e espera o token **puro**, sem o prefixo `"Bearer "`:
>
> ```
> authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
> ```
>
> Isso está assim tanto no Frontend (`headers: { authorization: token }`) quanto no Backend (`jwt.verify(authHeader, ...)`), então funciona — mas é uma particularidade deste projeto, não um padrão de mercado.

---

## 14. Chat em tempo real (Socket.io)

- O servidor de Socket.io sobe junto com o Backend, na **porta 8080** (`Backend/src/index.js`).
- O Frontend se conecta a ele em `Frontend/src/components/Join/Join.jsx`, usando `socket.io-client`.
- Eventos usados:
  - `set_username` — o cliente informa o nome de exibição escolhido.
  - `message` — o cliente envia uma nova mensagem de texto.
  - `receive_message` — o servidor retransmite a mensagem (`authorId`, `author`, `text`) para **todos** os clientes conectados.
- O chat é **global** (não existem salas/rooms separadas) — todo mundo que estiver na tela de chat ao mesmo tempo participa da mesma conversa.

---

## 15. Mapa de telas do Frontend

| Rota | Componente | O que faz |
|---|---|---|
| `/` | `HomePage` | Página inicial (institucional/apresentação) |
| `/products` | `ProductPage` | Catálogo de produtos, filtros por categoria, cadastro/edição/exclusão |
| `/auth` | `AuthPage` | Login e registro (alterna entre os dois formulários na mesma tela) |
| `/chatpage` | `ChatPage` | Chat de suporte em tempo real |

Todas as rotas são filhas de `Layout` (`Frontend/src/router.jsx`), que sempre desenha a `Navbar` no topo e o conteúdo da rota atual logo abaixo (`<Outlet />` do React Router).

---

## 16. Scripts disponíveis

### Backend (`Backend/package.json`)

| Script | Comando | O que faz |
|---|---|---|
| `npm run dev` | `nodemon src/index.js` | Sobe o servidor em modo desenvolvimento, reiniciando a cada alteração de arquivo |

### Frontend (`Frontend/package.json`)

| Script | Comando | O que faz |
|---|---|---|
| `npm run dev` | `vite` | Sobe o servidor de desenvolvimento (com hot-reload) |
| `npm run build` | `vite build` | Gera a versão de produção (arquivos estáticos otimizados) em `dist/` |
| `npm run preview` | `vite preview` | Sobe um servidor local para testar o resultado do `build` |
| `npm run lint` | `eslint .` | Roda o linter em todo o código-fonte do Frontend |

> Os scripts de **teste** (`npm test`, `npm run test:coverage` etc.) são adicionados durante o curso descrito na [Apostila de Testes](./APOSTILA-TESTES.md) — o projeto, hoje, ainda não tem testes automatizados configurados.

---

## 17. Padrões de código e Lint

O Frontend usa **ESLint** (configurado em `Frontend/eslint.config.js`) com regras para React e React Hooks — por exemplo, ele avisa sobre `useEffect` com dependências faltando ou variáveis declaradas e nunca usadas. Antes de commitar mudanças no Frontend, rode:

```bash
cd Frontend
npm run lint
```

O Backend não tem um linter configurado até o momento.

**Convenções observadas no código** (para manter consistência ao contribuir):
- Nomes de componentes React em `PascalCase`, um componente por pasta, com um `.jsx` e um `.css` de mesmo nome (ex: `Product/Product.jsx` + `Product/Product.css`).
- Estilos usam **variáveis CSS** centralizadas em `Frontend/src/index.css` (`--bg`, `--text`, `--accent`, etc.), com suporte a tema claro/escuro via `prefers-color-scheme`. Evite cores "cravadas" (`#ffffff`, `black`) em componentes novos — prefira as variáveis já existentes.
- No Backend, os controllers são classes com métodos `static async` (ex: `UserController.LoginUser`), e cada recurso tem um par `controller/` + `router/`.

---

## 18. Problemas comuns (Troubleshooting)

| Sintoma | Causa provável | Como resolver |
|---|---|---|
| `Error: listen EADDRINUSE: address already in use :::8080` (ou `:::4444`) | Já existe um processo Node usando essa porta (ex: uma instância antiga do `npm run dev` ainda aberta) | Feche o processo antigo, ou descubra e finalize-o (no Windows: `Get-Process node` no PowerShell, depois `Stop-Process -Id <PID>`) |
| Tela de produtos em branco / erro no console `Network Error` | O Backend não está rodando, ou está em outra porta | Confira se `npm run dev` está ativo em `Backend/` e se a porta é `4444` |
| `Erro ao conectar com o mongoDB` no console do Backend | `dbUrl` errada no `.env`, IP não liberado no MongoDB Atlas, ou sem internet | Revise o `.env` (seção 7); no Atlas, confirme em **Network Access** que seu IP está liberado |
| Login sempre retorna "Senha incorreta" mesmo com a senha certa | `JWT_SECRET` foi alterado depois que tokens antigos foram emitidos, ou o hash da senha foi corrompido | Registre um novo usuário para testar; confirme que o `.env` não foi alterado no meio de uma sessão de testes |
| CORS bloqueando requisições no navegador | Frontend rodando em uma porta diferente de `5173` (o Socket.io está configurado para aceitar só essa origem) | Rode o Frontend na porta padrão do Vite (`5173`), ou ajuste a configuração de CORS em `Backend/src/index.js` |
| `npm install` falha por causa de versões | O `package-lock.json` do Backend não é versionado (está no `.gitignore`) — instalações em momentos diferentes podem trazer versões `minor`/`patch` diferentes das bibliotecas | Normalmente não é um problema, mas se algo quebrar de forma inesperada, compare a versão instalada com a exigida em `package.json` |

---

## 19. Testes automatizados

Este projeto **ainda não possui testes automatizados**. Existe, porém, um material didático completo — a **[Apostila de Testes (APOSTILA-TESTES.md)](./APOSTILA-TESTES.md)** — com 16 aulas passo a passo ensinando a implementar, dentro deste mesmo projeto:

- Testes de Unidade (Jest no Backend / Vitest no Frontend);
- Testes de Integração (Supertest + MongoDB em memória / React Testing Library + MSW);
- Testes de Sistema (Docker + chamadas HTTP reais / Playwright);
- Testes de Aceitação (Gherkin/BDD);
- Testes Funcionais E2E com dados gerados por Faker.js;
- Testes de Carga/Performance (k6);
- Cobertura de código (Coverage).

---

## 20. Possíveis próximos passos

Ideias de evolução para quem for continuar o projeto (não implementadas ainda):

- Adicionar validação de e-mail duplicado no registro (hoje é possível criar dois usuários com o mesmo e-mail).
- Separar `Backend/src/index.js` em `app.js` (monta o Express) e `server.js` (efetivamente sobe o servidor) — facilita testes automatizados (ver Aula 1 da apostila de testes).
- Adicionar paginação na listagem de produtos.
- Adicionar confirmação antes de excluir um produto na interface.
- Criar salas (`rooms`) no chat, ao invés de uma conversa global única.
- Configurar CI (Integração Contínua) rodando lint e testes automaticamente a cada `push`.
