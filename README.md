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
│                           │◀──────────────────────────────▶│  http://localhost:4444    │
└─────────────────────────┘                                └────────────┬─────────────┘
                                                                          │
                                                                          │ Mongoose (ODM)
                                                                          ▼
                                                              ┌──────────────────────────┐
                                                              │   MongoDB (Atlas/nuvem)   │
                                                              └──────────────────────────┘
```

- O **Frontend** é uma *Single Page Application* (SPA): o navegador carrega uma única página HTML e o React troca o conteúdo dinamicamente, sem recarregar a página, usando o React Router.
- O **Backend** expõe uma **API REST** e o chat Socket.io no mesmo servidor HTTP.
- O banco de dados é o **MongoDB**, um banco não-relacional (documentos em formato parecido com JSON), acessado através da biblioteca **Mongoose**.

O Express e o Socket.io compartilham um único servidor HTTP na porta `PORT` (padrão `4444`). `src/app.js` monta as rotas/middlewares; `src/server.js` valida a configuração, conecta ao MongoDB e inicia o servidor.

---

## 3. Estrutura de pastas

```
Projeto-Testes/                   ← pasta raiz do projeto (workspace)
├── APOSTILA-TESTES.md            ← material didático de testes (16 aulas)
├── DOCUMENTACAO.md               ← este documento
│
├── Backend/                      ← API REST + servidor de chat
│   ├── .env                      ← variáveis de ambiente (NÃO vai para o Git)
│   ├── .gitignore
│   ├── package.json
│   └── src/
│       ├── app.js                ← configuração de segurança e rotas HTTP
│       ├── server.js             ← inicializa DB, HTTP e Socket.io
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

Este workspace é um único repositório Git com Backend e Frontend versionados juntos.

---

## 7. Configurando as variáveis de ambiente

O Backend depende de um arquivo `Backend/.env`, que **não é versionado no Git** (está listado no `.gitignore` por segurança — ele guarda segredos). Você precisa criá-lo manualmente.

Crie o arquivo `Backend/.env` com o seguinte conteúdo, substituindo pelos seus próprios valores:

```env
dbUrl = "mongodb+srv://<usuario>:<senha>@<seu-cluster>.mongodb.net/?appName=<nome-da-app>"
PORT = 4444

JWT_SECRET = "escolha-uma-chave-secreta-forte-aqui"
CORS_ORIGINS = "http://localhost:5173"
```

| Variável | O que é | Onde conseguir |
|---|---|---|
| `dbUrl` | String de conexão do MongoDB | No painel do MongoDB Atlas: **Connect → Drivers**, copie a *connection string* e troque `<usuario>`/`<senha>` pelos dados do seu banco |
| `PORT` | Porta em que a API HTTP (Express) vai escutar | Pode manter `4444` (é a porta que o Frontend já espera, veja a seção 9) |
| `JWT_SECRET` | Chave secreta usada para assinar e validar os tokens de login | Use pelo menos 32 caracteres aleatórios (ex.: `openssl rand -hex 32`). A API não inicia sem ela. **Nunca** compartilhe ou suba essa chave |
| `CORS_ORIGINS` | Origens autorizadas para a API e o chat | Lista separada por vírgula; por padrão `http://localhost:5173` e `http://127.0.0.1:5173` |
| `AUTH_LOGIN_LIMIT` | Tentativas de login por IP em 15 minutos | Padrão `10`; aumente apenas em ambiente isolado de teste de carga. Em produção com várias instâncias, configure um rate-limit store compartilhado |

> Copie `Backend/.env.example` para `Backend/.env` e preencha as configurações. A senha de cadastro exige no mínimo 12 caracteres, letras e números.

Copie `Frontend/.env.example` para `Frontend/.env.local` para configurar `VITE_API_URL` e `VITE_SOCKET_URL`. Ambas usam `http://localhost:4444` por padrão.

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
{"level":"info","message":"MongoDB connected"}
{"level":"info","message":"API and chat server listening","port":4444}
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
- `401 Unauthorized` → credenciais inválidas

### 11.2 Produtos — `/products`

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| `GET` | `/products/` | Não | Lista todos os produtos |
| `POST` | `/products/create-product` | **Sim** | Cria um novo produto |
| `PUT` | `/products/edit-product` | **Sim** | Edita um produto existente |
| `DELETE` | `/products/delete-product/:id` | **Sim** | Remove um produto pelo id |

**`GET /products/?page=1&limit=20&type=masculino&search=camiseta`** → `200 OK`:

```json
{
  "products": [
    { "_id": "...", "name": "Camiseta", "mark": "Mynds", "color": "Azul", "price": 59.9, "type": "masculino", "releaseDate": "2026-05-14T00:00:00.000Z" }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

Os parâmetros `page` e `limit` são opcionais (padrões `1` e `20`, limite máximo `100`); `type` e `search` também são opcionais.

**`POST /products/create-product`** — exige `Authorization: Bearer <token>` e o corpo:

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

O código-fonte também contém dois conjuntos de rotas de exemplo, usados como material de estudo, que **não estão conectados** ao `Backend/src/app.js` (ou seja, não respondem a nenhuma requisição, mesmo com o servidor rodando):

- `router/primeiroRouter.js` + `controller/primeiroController.js` — uma rota `GET /olamundo`, o exemplo mais simples possível de rota Express.
- `router/cadastro.js` + `controller/cadastro.js` — um CRUD de usuário "de brinquedo", que apenas devolve mensagens fixas, sem tocar o banco de dados.

Para ativá-las (por exemplo, em uma aula sobre Express), basta importar e registrar em `Backend/src/app.js`, do mesmo jeito que `productRouter` e `userRouter` já estão:

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
4. Em toda requisição que precisa de login (criar/editar/excluir produto), o Frontend envia `Authorization: Bearer <token>`.
5. O Backend usa o middleware `UserController.authenticateToken` para conferir esse token antes de deixar a requisição chegar ao controller de produtos.

O Backend aceita somente tokens JWT assinados com HS256; requisições sem token recebem `401`, e tokens inválidos/expirados recebem `403`. Login e cadastro têm limites de tentativas. Respostas de erro não incluem detalhes internos.

---

## 14. Chat em tempo real (Socket.io)

- O servidor de Socket.io sobe junto com a API, na porta definida por `PORT` (padrão `4444`).
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
| `npm run dev` | `nodemon src/server.js` | Sobe o servidor em modo desenvolvimento, reiniciando a cada alteração de arquivo |

### Frontend (`Frontend/package.json`)

| Script | Comando | O que faz |
|---|---|---|
| `npm run dev` | `vite` | Sobe o servidor de desenvolvimento (com hot-reload) |
| `npm run build` | `vite build` | Gera a versão de produção (arquivos estáticos otimizados) em `dist/` |
| `npm run preview` | `vite preview` | Sobe um servidor local para testar o resultado do `build` |
| `npm run lint` | `eslint .` | Roda o linter em todo o código-fonte do Frontend |

O Backend tem Jest + Supertest e o Frontend tem Vitest + Testing Library/MSW. Use `npm test`, `npm run test:coverage` e `npm run lint` dentro de cada aplicação.

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
| `Error: listen EADDRINUSE: address already in use :::4444` | Já existe um processo Node usando a porta da API/chat (ex: outra instância do `npm run dev`) | Feche o processo antigo ou configure outra porta no `PORT` |
| Tela de produtos em branco / erro no console `Network Error` | O Backend não está rodando, ou está em outra porta | Confira se `npm run dev` está ativo em `Backend/` e se a porta é `4444` |
| Erro de conexão MongoDB no log estruturado | `dbUrl` errada no `.env`, IP não liberado no MongoDB Atlas, ou sem internet | Revise o `.env` (seção 7); no Atlas, confirme em **Network Access** que seu IP está liberado |
| Login retorna "Credenciais inválidas" | A conta pode não existir ou a senha não corresponde | Confirme o e-mail; use uma senha de pelo menos 12 caracteres ao criar a conta |
| CORS bloqueando requisições no navegador | Origem do Frontend não está em `CORS_ORIGINS` | Adicione a origem exata, separada por vírgula, em `Backend/.env` |
| API não inicia por `JWT_SECRET` inválido | A chave está ausente ou tem menos de 32 caracteres | Gere uma chave aleatória com `openssl rand -hex 32` e guarde somente no `.env` |

---

## 19. Testes automatizados

Este projeto inclui testes automatizados. A **[Apostila de Testes (APOSTILA-TESTES.md)](./APOSTILA-TESTES.md)** documenta os conceitos e práticas usados:

- Testes de Unidade (Jest no Backend / Vitest no Frontend);
- Testes de Integração (Supertest + MongoDB em memória / React Testing Library + MSW);
- Testes de Sistema (Docker + chamadas HTTP reais / Playwright);
- Testes de Aceitação (Gherkin/BDD);
- Testes Funcionais E2E com dados gerados por Faker.js;
- Testes de Carga/Performance (k6);
- Cobertura de código (Coverage).

---

## 20. Possíveis próximos passos

Ideias de evolução para quem for continuar o projeto:

- Adicionar confirmação antes de excluir um produto na interface.
- Criar salas (`rooms`) no chat, ao invés de uma conversa global única.
- Usar cookies `HttpOnly` com proteção CSRF em vez de guardar JWT no `localStorage`, se a arquitetura de autenticação migrar para sessão por cookie.
