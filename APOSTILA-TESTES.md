# Apostila de Testes de Software — Projeto Mynds

**Curso de 16 aulas (1h30 cada) — 8 aulas de Backend + 8 aulas de Frontend**

Este material foi criado para ensinar, **na prática e dentro do projeto real Mynds**, todos os tipos de teste de software:

- Testes de Unidade
- Testes de Integração
- Testes de Sistema
- Testes de Aceitação
- Testes Funcionais de Carga (Performance)
- Cobertura de Código (Coverage)
- CI/CD (Integração e Entrega Contínua) — automatizando tudo isso a cada `push`

> ⚠️ **Importante para o professor**: os exemplos de código aqui são para **serem digitados e explicados em aula**. O projeto ainda não tem as dependências de teste instaladas — isso faz parte da Aula 1 de cada bloco (Backend e Frontend). Não existem arquivos de teste prontos no repositório: essa é justamente a atividade que o aluno vai construir, aula após aula.

---

## Sumário / Cronograma

| # | Aula | Bloco | Tipo de teste |
|---|------|-------|----------------|
| 1 | Setup do ambiente de testes + Pirâmide de Testes | Backend | Fundamentos |
| 2 | Funções puras e utilitárias | Backend | Unidade (I) |
| 3 | Controllers isolados com mocks | Backend | Unidade (II) |
| 4 | Rotas HTTP com banco em memória | Backend | Integração (I) |
| 5 | Fluxos completos e middlewares | Backend | Integração (II) |
| 6 | Ambiente completo, caixa-preta | Backend | Sistema |
| 7 | Performance sob carga | Backend | Carga / Performance |
| 8 | Cobertura de código no Backend | Backend | Coverage + CI/CD |
| 9 | Setup do ambiente de testes Frontend | Frontend | Fundamentos |
| 10 | Componentes puros e apresentacionais | Frontend | Unidade (I) |
| 11 | Componentes com estado e interação | Frontend | Unidade (II) |
| 12 | Mock de API e integração de telas | Frontend | Integração (I) |
| 13 | Roteamento e autenticação | Frontend | Integração (II) |
| 14 | Fluxo completo no navegador (E2E) | Frontend | Sistema |
| 15 | Critérios de aceitação (BDD) | Frontend | Aceitação |
| 16 | Cobertura no Frontend + Revisão geral | Frontend | Coverage + CI/CD |

---

## Parte 0 — Fundamentos (antes da Aula 1)

### 0.1 Por que testar?

Testes automatizados existem para responder uma pergunta simples, de forma rápida e repetível: **"o sistema ainda funciona depois da minha mudança?"**. Sem testes, essa pergunta só pode ser respondida clicando manualmente em tudo — o que é lento, cansativo e humano demais para pegar todos os casos.

### 0.2 A Pirâmide de Testes

```
                /\
               /  \        Poucos, lentos, caros
              / E2E \      (Sistema / Aceitação)
             /--------\
            /Integração\   Um pouco mais
           /------------\
          /   Unidade     \  Muitos, rápidos, baratos
         /------------------\
```

- **Base larga (Unidade)**: testam uma função/componente isolado. Rápidos (milissegundos), baratos de manter, rodam centenas por segundo.
- **Meio (Integração)**: testam se duas ou mais peças conversam corretamente (ex: rota HTTP + controller + banco).
- **Topo (Sistema / E2E / Aceitação)**: testam o sistema todo, como um usuário real usaria. Lentos, mas dão a maior confiança.
- **Carga/Performance** e **Coverage** não fazem parte da pirâmide clássica — são **eixos transversais**: carga mede *quão bem* o sistema aguenta uso real, coverage mede *quanto do código* está protegido pelos outros testes.

### 0.3 Definições que vamos usar o curso inteiro

| Tipo | Pergunta que responde | Ferramenta no projeto |
|------|------------------------|-------------------------|
| **Unidade** | Essa função/componente, sozinho, faz o que promete? | Jest (backend) / Vitest (frontend) |
| **Integração** | Essas peças, juntas, conversam direito? | Supertest + mongodb-memory-server / React Testing Library + MSW |
| **Sistema** | O sistema completo, rodando de verdade, funciona ponta a ponta? | Docker + chamadas HTTP reais / Playwright |
| **Aceitação** | O sistema atende ao que o *negócio*/usuário pediu? | Gherkin + Playwright |
| **Carga** | O sistema aguenta a quantidade de uso esperada sem degradar? | k6 |
| **Coverage** | Quanto do meu código está sendo exercitado pelos testes? | `--coverage` (Jest) / `v8` (Vitest) |

### 0.4 O projeto Mynds (mapa geral)

```
Segunda/
├── Backend/           → API REST (Node + Express + MongoDB/Mongoose) + Socket.io (chat)
│   └── src/
│       ├── index.js            → sobe o servidor HTTP + o servidor de Socket.io
│       ├── config/database.js  → conexão com o MongoDB
│       ├── controller/         → regras de negócio (UserController, ProductController...)
│       ├── router/             → mapeia rotas HTTP → controllers
│       ├── models/              → schemas Mongoose (User, Product)
│       └── functions/          → funções soltas (soma, hello, ola) — ótimas para o 1º teste
│
└── Frontend/          → SPA em React (Vite) que consome a API acima
    └── src/
        ├── components/         → peças reutilizáveis (Product, CategoryCard, LoginForm...)
        ├── pages/               → telas (ProductPage, AuthPage, ChatPage, HomePage)
        ├── fn-helpers/          → funções puras (FormatarData, categories)
        └── router.jsx           → rotas do React Router
```

Guarde esse mapa — cada aula vai apontar para arquivos reais dentro dele.

---

# PARTE A — BACKEND (Aulas 1 a 8)

## Aula 1 — Setup do ambiente de testes + Pirâmide de Testes

### Objetivo da aula
Preparar o projeto `Backend` para rodar testes automatizados e entender, na prática, por que separamos "o app" de "o servidor ligado".

### 1.1 Instalando as ferramentas

Dentro de `Backend/`:

```bash
npm install --save-dev jest supertest mongodb-memory-server cross-env
```

- **Jest**: framework de testes (roda os arquivos `*.test.js`, dá `expect`, `describe`, `it`).
- **Supertest**: faz requisições HTTP contra o Express *sem precisar abrir uma porta de verdade*.
- **mongodb-memory-server**: sobe um MongoDB de mentirinha, em memória, só para os testes. Assim os testes nunca tocam no banco de produção (`myndscluster` do `.env`).
- **cross-env**: garante que `NODE_ENV=test` funcione igual no Windows e no Linux/Mac.

Como o projeto usa `"type": "module"` (ES Modules), adicione em `Backend/package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "test": "cross-env NODE_ENV=test node --experimental-vm-modules node_modules/.bin/jest --runInBand",
    "test:watch": "cross-env NODE_ENV=test node --experimental-vm-modules node_modules/.bin/jest --watch",
    "test:coverage": "cross-env NODE_ENV=test node --experimental-vm-modules node_modules/.bin/jest --coverage"
  }
}
```

> **Por que `--experimental-vm-modules`?** O Jest, por padrão, entende CommonJS (`require`). Como o Backend usa `import/export` (ESM), precisamos avisar o Node para o Jest rodar em modo experimental de módulos ES.

Crie `Backend/jest.config.js`:

```js
export default {
  testEnvironment: "node",
  transform: {},                     // não precisamos do Babel, o Node já entende ESM
  testMatch: ["**/*.test.js"],
  setupFiles: ["dotenv/config"],     // garante que o .env seja carregado nos testes também
};
```

### 1.2 Por que separar `app.js` de `server.js`?

Hoje, `Backend/src/index.js` faz **tudo junto**: cria o `app`, registra rotas, **e já chama `app.listen(...)`**. Isso é um problema para testes: o Supertest não precisa (e não deveria) abrir uma porta real — ele conversa direto com o objeto `app` do Express.

**Refatoração didática (mostre a diferença ao aluno):**

`Backend/src/app.js` (novo arquivo — só monta o app, não escuta porta nenhuma):

```js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import productRouter from './router/ProductRouter.js';
import userRouter from './router/UserRouter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());
app.use('/products', productRouter);
app.use('/auth', userRouter);
```

`Backend/src/server.js` (o único arquivo que efetivamente "liga" o servidor):

```js
import { config } from 'dotenv';
config();
import { createServer } from 'http';
import { Server } from 'socket.io';
import { app } from './app.js';
import { connectDatabase } from './config/database.js';

const port = process.env.PORT || 8000;
const server = createServer(app);

const serverSocket = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'], credentials: true },
});

serverSocket.on('connection', (socket) => {
  socket.on('set_username', (username) => { socket.data.username = username; });
  socket.on('message', (text) => {
    serverSocket.emit('receive_message', { authorId: socket.id, author: socket.data.username, text });
  });
});

server.listen(8080, () => console.log('Servidor socket rodando na porta 8080'));
app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
connectDatabase();
```

E o `package.json` passa a rodar `"dev": "nodemon src/server.js"`.

> **Ponto pedagógico:** essa separação (`app` exportável × `server` que liga tudo) é o padrão usado em praticamente todo projeto Express testável do mercado. É a base para todas as Aulas 4, 5 e 6.

### 1.3 Seu primeiro teste (smoke test de verdade)

Comece pelo mais simples possível: `Backend/src/functions/soma.js` já existe no projeto:

```js
export function soma(a, b) {
    return a + b
}
```

Crie `Backend/src/functions/soma.test.js`:

```js
import { soma } from "./soma.js";

describe("soma()", () => {
  it("deve somar dois números positivos", () => {
    expect(soma(2, 3)).toBe(5);
  });

  it("deve funcionar com números negativos", () => {
    expect(soma(-2, -3)).toBe(-5);
  });
});
```

Rode:

```bash
npm test
```

**Explique ao aluno a anatomia do teste:**
- `describe` → agrupa testes relacionados (aqui, tudo sobre a função `soma`).
- `it` (ou `test`) → um caso de teste específico, com uma frase que descreve o comportamento esperado.
- `expect(resultado).toBe(esperado)` → a *asserção*: compara o que a função devolveu com o que era esperado.

### Tarefa de casa da Aula 1
Escrever testes equivalentes para `hello.js` e `ola.js` (também em `functions/`), incluindo um caso onde o texto passado é uma string vazia.

---

## Aula 2 — Testes de Unidade I: funções puras e utilitárias

### Objetivo da aula
Entender o conceito de **função pura** (mesma entrada → mesma saída, sem efeitos colaterais) e por que ela é o tipo de código mais fácil e barato de testar.

### 2.1 O que faz uma unidade ser "isolada"

Uma função pura não lê banco de dados, não faz requisição de rede, não depende de `Date.now()` sem controle, não muda variáveis fora dela. Isso a torna **100% previsível**.

No projeto atual, a maior parte da lógica de negócio está "grudada" dentro dos controllers (`UserController.RegisterUser`, por exemplo, mistura validação + hash de senha + acesso ao banco tudo junto). Isso dificulta o teste de unidade puro. Vamos extrair uma regra de negócio pura como exercício.

### 2.2 Refatorando para extrair uma função pura

Olhe o trecho de `Backend/src/controller/UserController.js`:

```js
static async RegisterUser(req,res) {
  const {name,age,email,password,confirmPassword} = req.body;

  if (confirmPassword !== password){
    return res.status(400).json({message:"As senhas são diferentes!"})
  }
  // ...
}
```

A regra `confirmPassword !== password` é uma **regra de negócio pura**. Vamos extraí-la para um arquivo próprio, fácil de testar sem precisar de Express nem banco:

`Backend/src/validators/userValidators.js`:

```js
export function senhasConferem(password, confirmPassword) {
  return password === confirmPassword;
}

export function idadeValida(age) {
  return Number.isInteger(age) && age >= 0 && age <= 130;
}

export function emailValido(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

E o controller passa a **usar** essas funções (menos lógica embutida, mais fácil de ler e testar):

```js
import { senhasConferem } from "../validators/userValidators.js";
// ...
if (!senhasConferem(password, confirmPassword)) {
  return res.status(400).json({ message: "As senhas são diferentes!" });
}
```

### 2.3 Testando as funções puras

`Backend/src/validators/userValidators.test.js`:

```js
import { senhasConferem, idadeValida, emailValido } from "./userValidators.js";

describe("senhasConferem()", () => {
  it("retorna true quando as senhas são iguais", () => {
    expect(senhasConferem("123456", "123456")).toBe(true);
  });

  it("retorna false quando as senhas são diferentes", () => {
    expect(senhasConferem("123456", "abcdef")).toBe(false);
  });
});

describe("idadeValida()", () => {
  it.each([
    [18, true],
    [0, true],
    [130, true],
    [-1, false],
    [131, false],
    [17.5, false],
  ])("idadeValida(%i) deve retornar %s", (idade, esperado) => {
    expect(idadeValida(idade)).toBe(esperado);
  });
});

describe("emailValido()", () => {
  it("aceita um e-mail bem formado", () => {
    expect(emailValido("aluno@mynds.com")).toBe(true);
  });

  it("rejeita um e-mail sem @", () => {
    expect(emailValido("alunomynds.com")).toBe(false);
  });
});
```

**Ponto pedagógico — `it.each`:** ao invés de copiar e colar o mesmo teste várias vezes trocando só o valor, usamos uma tabela de casos. Isso é chamado de **teste parametrizado** e é uma técnica muito usada no mercado para cobrir várias combinações sem repetir código.

### 2.4 Padrão AAA (Arrange, Act, Assert)

Todo teste de unidade bem escrito segue essas 3 fases — mostre isso explicitamente no quadro:

```js
it("retorna false quando as senhas são diferentes", () => {
  // Arrange (organizar): preparar os dados de entrada
  const senha = "123456";
  const confirmacao = "abcdef";

  // Act (agir): executar a função que queremos testar
  const resultado = senhasConferem(senha, confirmacao);

  // Assert (verificar): confirmar que o resultado é o esperado
  expect(resultado).toBe(false);
});
```

### Tarefa de casa da Aula 2
Extrair também a formatação de resposta de erro genérica em uma função `respostaErro(mensagem)` e escrever os testes dela.

---

## Aula 3 — Testes de Unidade II: Controllers isolados com mocks

### Objetivo da aula
Testar `UserController` e `ProductController` **sem** precisar de um MongoDB de verdade, usando **mocks** (substitutos falsos) para `bcrypt`, `jsonwebtoken` e os models do Mongoose.

### 3.1 O que é um mock e por que usar

Um **mock** é uma versão falsa de uma dependência, criada só para o teste, que permite:
1. Controlar exatamente o que ela retorna (`User.findOne` "encontrando" ou "não encontrando" um usuário).
2. Verificar se ela foi chamada, com quais argumentos, quantas vezes.
3. Evitar efeitos colaterais reais (nada é gravado em banco nenhum).

Isso é o que diferencia **unidade** de **integração**: no teste de unidade do controller, tudo ao redor dele é fingido.

### 3.2 Mockando o model `User` e o `bcrypt`

`Backend/src/controller/UserController.test.js`:

```js
import { jest } from "@jest/globals";

// jest.unstable_mockModule é necessário em projetos ESM (import/export)
jest.unstable_mockModule("../models/user.js", () => ({
  User: { findOne: jest.fn(), }
}));
jest.unstable_mockModule("bcrypt", () => ({
  default: { compare: jest.fn(), hash: jest.fn() }
}));
jest.unstable_mockModule("jsonwebtoken", () => ({
  default: { sign: jest.fn(), verify: jest.fn() }
}));

const { User } = await import("../models/user.js");
const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;
const { default: UserController } = await import("./UserController.js");

function criarResMock() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("UserController.LoginUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 404 quando o usuário não existe", async () => {
    User.findOne.mockResolvedValue(null);
    const req = { body: { email: "naoexiste@mynds.com", password: "123" } };
    const res = criarResMock();

    await UserController.LoginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Usuario nao encontrado no DB" });
  });

  it("retorna 401 quando a senha está incorreta", async () => {
    User.findOne.mockResolvedValue({ _id: "1", email: "a@a.com", password: "hash" });
    bcrypt.compare.mockResolvedValue(false);
    const req = { body: { email: "a@a.com", password: "errada" } };
    const res = criarResMock();

    await UserController.LoginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("retorna 200 e um token quando o login é válido", async () => {
    User.findOne.mockResolvedValue({ _id: "1", email: "a@a.com", password: "hash" });
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("token-falso-123");
    const req = { body: { email: "a@a.com", password: "correta" } };
    const res = criarResMock();

    await UserController.LoginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ token: "token-falso-123" });
  });
});
```

**Explicando o `criarResMock()`:** o Express injeta `req` e `res` de verdade nos controllers, mas nos testes de unidade nós **fabricamos** um `res` fake, só com `status()` e `json()`, retornando `res` de si mesmo para permitir o encadeamento `res.status(200).json(...)` — exatamente como o código real faz.

### 3.3 Testando `ProductController` com mocks

```js
jest.unstable_mockModule("../models/product.js", () => ({
  Product: {
    find: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
  }
}));

const { Product } = await import("../models/product.js");
const { default: ProductController } = await import("./ProductController.js");

describe("ProductController.deleteProduct", () => {
  it("chama Product.findByIdAndDelete com o id da URL e responde com sucesso", async () => {
    Product.findByIdAndDelete.mockResolvedValue({});
    const req = { params: { id: "abc123" } };
    const res = criarResMock();

    await ProductController.deleteProduct(req, res);

    expect(Product.findByIdAndDelete).toHaveBeenCalledWith("abc123");
    expect(res.json).toHaveBeenCalledWith({ message: "Deletado com sucesso!" });
  });
});
```

### 3.4 Testando o middleware `authenticateToken` isoladamente

```js
describe("UserController.authenticateToken", () => {
  it("retorna 401 quando não há header authorization", () => {
    const req = { headers: {} };
    const res = criarResMock();
    const next = jest.fn();

    UserController.authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("chama next() quando o token é válido", () => {
    jwt.verify.mockImplementation((token, secret, cb) => cb(null, { userId: "1" }));
    const req = { headers: { authorization: "token-valido" } };
    const res = criarResMock();
    const next = jest.fn();

    UserController.authenticateToken(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ userId: "1" });
  });
});
```

> **Discussão em aula:** repare que o `authenticateToken` do projeto espera o header `authorization` **sem** o prefixo `"Bearer "` — isso é diferente do padrão HTTP mais comum. É uma ótima oportunidade para discutir com o aluno como testes de unidade documentam o comportamento real do código, mesmo quando ele foge da convenção.

### Tarefa de casa da Aula 3
Escrever os testes de unidade de `ProductController.createdProduct` e `ProductController.editProduct`, cobrindo o caminho feliz e o caso "produto não encontrado" do `editProduct`.

---

## Aula 4 — Testes de Integração I: rotas HTTP com banco em memória

### Objetivo da aula
Testar a aplicação **de verdade**, incluindo rota → controller → banco de dados, mas usando um banco descartável (em memória), com `supertest`.

### 4.1 A diferença entre unidade (Aula 3) e integração (essa aula)

| | Aula 3 (Unidade) | Aula 4 (Integração) |
|---|---|---|
| Model do Mongoose | mockado (fake) | real, conectado a um Mongo em memória |
| O que estamos validando | a lógica do controller isoladamente | rota + middleware + controller + banco juntos |
| Velocidade | milissegundos | um pouco mais lento (ainda rápido) |

### 4.2 Setup do banco em memória

`Backend/src/test-utils/setupTestDb.js`:

```js
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer;

export async function conectarBancoDeTeste() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

export async function limparBancoDeTeste() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export async function fecharBancoDeTeste() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}
```

### 4.3 Testando a rota de registro (`POST /auth/register`)

`Backend/src/router/UserRouter.test.js`:

```js
import request from "supertest";
import { app } from "../app.js";
import { conectarBancoDeTeste, limparBancoDeTeste, fecharBancoDeTeste } from "../test-utils/setupTestDb.js";

beforeAll(async () => await conectarBancoDeTeste());
afterEach(async () => await limparBancoDeTeste());
afterAll(async () => await fecharBancoDeTeste());

describe("POST /auth/register", () => {
  it("cria um usuário novo e retorna 200", async () => {
    const resposta = await request(app)
      .post("/auth/register")
      .send({
        name: "Aluno Teste",
        age: 20,
        email: "aluno@mynds.com",
        password: "123456",
        confirmPassword: "123456",
      });

    expect(resposta.status).toBe(200);
    expect(resposta.body.message).toBe("Usuario criado com sucesso!");
    expect(resposta.body.data.email).toBe("aluno@mynds.com");
    // a senha NUNCA deve voltar em texto puro na resposta
    expect(resposta.body.data.password).not.toBe("123456");
  });

  it("retorna 400 quando as senhas não conferem", async () => {
    const resposta = await request(app)
      .post("/auth/register")
      .send({
        name: "Aluno Teste",
        age: 20,
        email: "aluno2@mynds.com",
        password: "123456",
        confirmPassword: "diferente",
      });

    expect(resposta.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/auth/register").send({
      name: "Aluno Teste",
      age: 20,
      email: "login@mynds.com",
      password: "123456",
      confirmPassword: "123456",
    });
  });

  it("faz login com credenciais corretas e devolve um token JWT", async () => {
    const resposta = await request(app)
      .post("/auth/login")
      .send({ email: "login@mynds.com", password: "123456" });

    expect(resposta.status).toBe(200);
    expect(typeof resposta.body.token).toBe("string");
  });

  it("retorna 401 com senha errada", async () => {
    const resposta = await request(app)
      .post("/auth/login")
      .send({ email: "login@mynds.com", password: "senhaerrada" });

    expect(resposta.status).toBe(401);
  });
});
```

**Ponto pedagógico — `beforeAll` × `afterEach` × `afterAll`:**
- `beforeAll`: conecta no banco de teste **uma vez**, antes de todos os testes do arquivo.
- `afterEach`: limpa as coleções **depois de cada teste**, para que um teste nunca "vaze" dados para o próximo (testes devem ser independentes entre si).
- `afterAll`: desliga tudo no final, liberando memória.

### 4.4 Testando a rota pública de produtos

```js
describe("GET /products/", () => {
  it("retorna uma lista vazia quando não há produtos", async () => {
    const resposta = await request(app).get("/products/");

    expect(resposta.status).toBe(200);
    expect(resposta.body.products).toEqual([]);
  });
});
```

### Tarefa de casa da Aula 4
Escrever o teste de integração de `POST /products/create-product` **sem enviar token** e verificar que a API responde com o status de erro correto (dica: hoje o `authenticateToken` chama `res.status(403)` quando o `jwt.verify` falha — investigue e documente o comportamento real).

---

## Aula 5 — Testes de Integração II: fluxos completos e middlewares

### Objetivo da aula
Testar um **fluxo de negócio inteiro**, que passa por várias rotas em sequência — e testar a integração do Socket.io (chat).

### 5.1 Fluxo completo: registrar → logar → criar produto → editar → deletar

`Backend/src/router/ProductRouter.test.js`:

```js
import request from "supertest";
import { app } from "../app.js";
import { conectarBancoDeTeste, limparBancoDeTeste, fecharBancoDeTeste } from "../test-utils/setupTestDb.js";

beforeAll(async () => await conectarBancoDeTeste());
afterEach(async () => await limparBancoDeTeste());
afterAll(async () => await fecharBancoDeTeste());

async function criarUsuarioEPegarToken() {
  await request(app).post("/auth/register").send({
    name: "Lojista", age: 30, email: "lojista@mynds.com",
    password: "123456", confirmPassword: "123456",
  });
  const login = await request(app).post("/auth/login").send({
    email: "lojista@mynds.com", password: "123456",
  });
  return login.body.token;
}

describe("Fluxo completo de produto", () => {
  it("cria, edita e deleta um produto autenticado", async () => {
    const token = await criarUsuarioEPegarToken();

    // 1. Criar
    const criar = await request(app)
      .post("/products/create-product")
      .set("authorization", token)
      .send({ name: "Camiseta", mark: "Mynds", color: "Azul", description: "Básica", price: 59.9, type: "masculino" });

    expect(criar.status).toBe(200);
    const produtoId = criar.body.data._id;

    // 2. Editar
    const editar = await request(app)
      .put("/products/edit-product")
      .set("authorization", token)
      .send({ _id: produtoId, name: "Camiseta Premium", mark: "Mynds", color: "Azul", description: "Básica", price: 79.9, type: "masculino" });

    expect(editar.status).toBe(200);
    expect(editar.body.updatedProduct.name).toBe("Camiseta Premium");

    // 3. Deletar
    const deletar = await request(app)
      .delete(`/products/delete-product/${produtoId}`)
      .set("authorization", token);

    expect(deletar.status).toBe(200);

    // 4. Confirmar que sumiu da listagem
    const listar = await request(app).get("/products/");
    expect(listar.body.products.find((p) => p._id === produtoId)).toBeUndefined();
  });

  it("não permite criar produto sem token", async () => {
    const resposta = await request(app)
      .post("/products/create-product")
      .send({ name: "Sem token", price: 10 });

    expect(resposta.status).toBe(401);
  });
});
```

**Ponto pedagógico:** este teste é maior e mais lento que os anteriores porque ele **encadeia várias requisições reais**. Isso é normal em teste de integração — o ganho é testar exatamente a costura entre as peças (rota → middleware de auth → controller → Mongoose → resposta).

### 5.2 Testando o Socket.io (chat)

O chat roda num servidor HTTP separado (`server.js`, porta 8080). Para testar de forma integrada, precisamos subir esse servidor de verdade (numa porta de teste) e conectar um cliente `socket.io-client`.

```bash
npm install --save-dev socket.io-client
```

`Backend/src/socket.test.js`:

```js
import { createServer } from "http";
import { Server } from "socket.io";
import { io as ioClient } from "socket.io-client";

let httpServer, ioServer, porta;

beforeAll((done) => {
  httpServer = createServer();
  ioServer = new Server(httpServer);

  ioServer.on("connection", (socket) => {
    socket.on("set_username", (username) => { socket.data.username = username; });
    socket.on("message", (text) => {
      ioServer.emit("receive_message", { authorId: socket.id, author: socket.data.username, text });
    });
  });

  httpServer.listen(() => {
    porta = httpServer.address().port;
    done();
  });
});

afterAll(() => {
  ioServer.close();
  httpServer.close();
});

it("transmite uma mensagem enviada por um cliente para os outros clientes conectados", (done) => {
  const clienteA = ioClient(`http://localhost:${porta}`);
  const clienteB = ioClient(`http://localhost:${porta}`);

  clienteB.on("receive_message", (mensagem) => {
    expect(mensagem.text).toBe("Olá suporte!");
    expect(mensagem.author).toBe("Aluno");
    clienteA.close();
    clienteB.close();
    done();
  });

  clienteA.on("connect", () => {
    clienteA.emit("set_username", "Aluno");
    clienteA.emit("message", "Olá suporte!");
  });
});
```

**Ponto pedagógico — testes assíncronos com `done`:** eventos de socket não retornam uma `Promise` diretamente; usamos o callback `done` do Jest para avisar "pode considerar esse teste terminado" só quando o evento `receive_message` realmente chegar.

### Tarefa de casa da Aula 5
Adaptar o teste de fluxo completo para também cobrir o caso de **editar um produto que não existe** (`_id` inválido) e conferir a resposta da API.

---

## Aula 6 — Testes de Sistema

### Objetivo da aula
Entender a diferença entre integração e sistema, e testar o Mynds **rodando de verdade, como um todo**, tratando-o como uma caixa-preta.

### 6.1 Integração × Sistema — qual é a diferença real?

| | Integração (Aulas 4-5) | Sistema (esta aula) |
|---|---|---|
| Banco | em memória, descartável | banco real (ou o mais próximo possível do real) |
| Quem sobe o servidor | o próprio Jest, dentro do processo de teste | um processo separado, rodando `npm run dev`/Docker |
| Quem faz as chamadas | supertest chamando o `app` do Express diretamente | requisições HTTP de verdade, por rede, contra `http://localhost:4444` |
| O que valida | a integração *entre módulos do código* | o *sistema publicado/implantável* como um todo (envs, portas, Docker, etc.) |

### 6.2 Preparando um ambiente de sistema com Docker

`Backend/docker-compose.test.yml`:

```yaml
services:
  mongo:
    image: mongo:7
    ports:
      - "27018:27017"

  backend:
    build: .
    environment:
      - dbUrl=mongodb://mongo:27017/mynds-sistema
      - PORT=4444
      - JWT_SECRET=segredo-de-teste
    ports:
      - "4444:4444"
    depends_on:
      - mongo
```

```bash
docker compose -f docker-compose.test.yml up -d
```

### 6.3 Escrevendo o teste de sistema

Esses testes ficam **fora** da pasta `src`, porque não rodam junto com o resto — rodam contra um servidor já de pé. Crie `Backend/system-tests/api.system.test.js`:

```js
const BASE_URL = process.env.SYSTEM_BASE_URL || "http://localhost:4444";

async function chamarApi(caminho, opcoes = {}) {
  const resposta = await fetch(`${BASE_URL}${caminho}`, {
    headers: { "Content-Type": "application/json", ...opcoes.headers },
    ...opcoes,
  });
  const corpo = await resposta.json().catch(() => null);
  return { status: resposta.status, corpo };
}

describe("[Sistema] Fluxo de cadastro e listagem de produtos", () => {
  it("o sistema completo responde no ar (smoke test)", async () => {
    const { status } = await chamarApi("/products/");
    expect(status).toBe(200);
  });

  it("cadastra usuário, loga e cria produto contra o sistema real", async () => {
    const email = `sistema-${Date.now()}@mynds.com`;

    const registro = await chamarApi("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name: "Teste Sistema", age: 25, email, password: "123456", confirmPassword: "123456" }),
    });
    expect(registro.status).toBe(200);

    const login = await chamarApi("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password: "123456" }),
    });
    expect(login.status).toBe(200);

    const criarProduto = await chamarApi("/products/create-product", {
      method: "POST",
      headers: { authorization: login.corpo.token },
      body: JSON.stringify({ name: "Produto de Sistema", price: 10, type: "outros" }),
    });
    expect(criarProduto.status).toBe(200);
  });
});
```

Rodando (com o backend já de pé via Docker/`npm run dev`):

```bash
npx jest system-tests --config '{"testEnvironment":"node"}'
```

### 6.4 Checklist de teste de sistema (para discutir em aula)

- [ ] As variáveis de ambiente (`.env`) usadas no teste são as de **teste/staging**, nunca produção.
- [ ] O banco usado é isolado (não é o `myndscluster` do Atlas usado em desenvolvimento).
- [ ] As portas (4444 API, 8080 socket, 5173 frontend) estão livres e configuradas.
- [ ] Os logs do servidor foram observados durante o teste (erros silenciosos aparecem no console).
- [ ] O teste falha claramente se o servidor não estiver no ar (timeout tratado).

### Tarefa de casa da Aula 6
Escrever um teste de sistema que sobe o Docker Compose, espera o backend responder (`/products/`) e, se não responder em 10 segundos, falha com uma mensagem clara — pesquisando sobre "polling com timeout" em JavaScript.

---

## Aula 7 — Testes Funcionais de Carga (Performance)

### Objetivo da aula
Entender que **funcionar corretamente** e **funcionar sob uso real** são coisas diferentes — e aprender a medir a segunda.

### 7.1 Vocabulário de performance

| Termo | O que significa |
|---|---|
| **Teste de carga** | Simula o número de usuários esperado em produção, mede se o sistema aguenta bem |
| **Teste de estresse** | Aumenta a carga além do esperado, para descobrir o ponto de ruptura |
| **Teste de pico (spike)** | Uma explosão repentina de requisições (ex: liquidação) |
| **Teste de resistência (soak)** | Carga moderada por um tempo longo, para achar vazamentos de memória |
| **p95 / p99** | 95% (ou 99%) das requisições foram respondidas em até X ms — melhor métrica que "média", porque não esconde os piores casos |
| **RPS** | Requests Per Second — quantas requisições o sistema processa por segundo |

### 7.2 Instalando o k6

O [k6](https://k6.io/) é uma ferramenta de linha de comando (não é pacote npm do projeto, é um binário separado). Instale conforme o SO do aluno (Windows: `choco install k6` ou `winget install k6`; Mac: `brew install k6`).

### 7.3 Script de carga contra `GET /products/`

`Backend/load-tests/listar-produtos.js`:

```js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },   // sobe gradualmente até 20 usuários simultâneos
    { duration: "1m", target: 20 },    // mantém 20 usuários por 1 minuto
    { duration: "10s", target: 0 },    // desce a carga
  ],
  thresholds: {
    http_req_duration: ["p(95)<300"],   // 95% das respostas devem vir em menos de 300ms
    http_req_failed: ["rate<0.01"],     // menos de 1% de erro
  },
};

export default function () {
  const resposta = http.get("http://localhost:4444/products/");

  check(resposta, {
    "status é 200": (r) => r.status === 200,
    "corpo tem a lista de produtos": (r) => JSON.parse(r.body).products !== undefined,
  });

  sleep(1);
}
```

Rodando (com o backend no ar):

```bash
k6 run load-tests/listar-produtos.js
```

### 7.4 Script de carga simulando login (fluxo com autenticação)

`Backend/load-tests/fluxo-login.js`:

```js
import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  vus: 10,          // 10 "usuários virtuais" simultâneos
  duration: "30s",
};

export default function () {
  const payload = JSON.stringify({ email: "carga@mynds.com", password: "123456" });
  const headers = { headers: { "Content-Type": "application/json" } };

  const login = http.post("http://localhost:4444/auth/login", payload, headers);

  check(login, {
    "login respondeu": (r) => r.status === 200 || r.status === 401 || r.status === 404,
  });

  sleep(1);
}
```

> **Nota didática:** para esse script funcionar de verdade retornando `200`, é preciso ter criado o usuário `carga@mynds.com` antes (por exemplo, num script de "setup" do próprio k6, usando a função `export function setup() { ... }`). Aproveite para explicar a diferença entre **dados de teste preparados** e **dados gerados na hora**.

### 7.5 Lendo o resultado do k6

O k6 imprime um resumo assim:

```
http_req_duration..............: avg=45.2ms  p(95)=120ms
http_req_failed.................: 0.00%
http_reqs.......................: 1200   40/s
```

Discuta com o aluno:
- `avg` sozinho **esconde problemas** (um usuário lento pode "sumir" na média). Sempre olhar `p(95)`/`p(99)`.
- `http_req_failed` alto é sinal de que o sistema está derrubando requisições sob carga — geralmente por esgotamento de conexões com o banco.
- Aqui é o momento de conectar com a Aula 5: o `mongoose.connect()` do projeto (`Backend/src/config/database.js`) não configura um **pool de conexões** explícito — ótimo gancho para uma discussão sobre configuração de performance.

### Tarefa de casa da Aula 7
Rodar o teste de carga contra `/products/` primeiro com 5 usuários virtuais, depois com 50, e comparar o `p(95)` — documentando a diferença num pequeno relatório.

---

## Aula 8 — Cobertura de Código (Coverage) no Backend

### Objetivo da aula
Aprender a medir **quanto do código-fonte é executado pelos testes**, interpretar esse número corretamente (e entender suas armadilhas).

### 8.1 O que o coverage mede (e o que ele NÃO mede)

Cobertura de código conta **linhas, ramos (`if/else`), funções e statements** que foram executados durante os testes. Ela **não** garante que os testes verificaram o resultado certo — só que aquele código *rodou*.

> Exemplo clássico para discutir em aula: um teste sem nenhum `expect()` dá 100% de cobertura na função testada e **zero** de garantia de qualidade. Cobertura é uma métrica de *risco*, não de *qualidade*.

### 8.2 Rodando o coverage

Já configuramos o script na Aula 1:

```bash
npm run test:coverage
```

Isso gera:
- Um resumo no terminal.
- Uma pasta `coverage/` com relatório HTML navegável (`coverage/lcov-report/index.html`).

### 8.3 Configurando metas mínimas (thresholds)

Em `jest.config.js`:

```js
export default {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/*.test.js"],
  setupFiles: ["dotenv/config"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",          // não faz sentido medir cobertura do "boot" do servidor
    "!src/functions/**",       // já cobrimos manualmente, opcional excluir exemplos didáticos
  ],
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 70,
      lines: 70,
    },
  },
};
```

Se a cobertura cair abaixo desses números, `npm run test:coverage` **falha** — isso é usado depois em CI (Aula 8 e 16 fecham esse assunto) para impedir merges que reduzam a qualidade do projeto.

### 8.4 Lendo o relatório

No terminal, aparece algo como:

```
--------------------|---------|----------|---------|---------|-------------------
File                | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------------|---------|----------|---------|---------|-------------------
All files           |   82.35 |    66.66 |   85.71 |   82.35 |
 UserController.js  |   90.00 |    75.00 |  100.00 |   90.00 | 63-64
 ProductController.js|  70.58 |    50.00 |   75.00 |   70.58 | 29-30,47
--------------------|---------|----------|---------|---------|-------------------
```

Explique ao aluno:
- **% Stmts** (statements): % de instruções executadas.
- **% Branch**: % de caminhos de decisão testados (o `if` foi testado nos dois sentidos — verdadeiro *e* falso?).
- **Uncovered Line #s**: aponta exatamente quais linhas nunca rodaram — é o melhor lugar para decidir o próximo teste a escrever.

No exemplo acima, `ProductController.js` linha 29-30 é o `if (!product) { return... }` do `editProduct` — sinal de que falta um teste para "editar produto inexistente" (a mesma tarefa de casa da Aula 5!).

### 8.5 CI/CD: rodando os testes do Backend automaticamente (GitHub Actions)

Até aqui, todo teste foi rodado **manualmente**, pela mão do aluno, no terminal. Isso tem um problema: nada garante que alguém vai lembrar de rodar `npm test` antes de subir código para o repositório. **CI (Integração Contínua)** resolve isso: a cada `push` ou `pull request`, um servidor "robô" roda os testes automaticamente, e **bloqueia o merge** se algo quebrar.

> **CI × CD, a diferença:** **CI (Continuous Integration)** é a parte que valida o código (lint, testes, build) a cada mudança. **CD (Continuous Delivery/Deployment)** é o passo seguinte, que pega um código já validado pelo CI e **publica** automaticamente (ex: sobe a nova versão da API num servidor). Nesta aula fechamos o CI do Backend; o CD (deploy) é discutido como extensão opcional ao final da Aula 16.

#### 8.5.1 Criando o workflow

O GitHub Actions lê arquivos YAML dentro de `.github/workflows/`. Crie `Backend/.github/workflows/backend-ci.yml` (ou, se o repositório do Backend for a raiz do próprio Git, `​.github/workflows/backend-ci.yml`):

```yaml
name: Backend CI

on:
  push:
    branches: ["main", "develop"]
    paths: ["Backend/**"]
  pull_request:
    branches: ["main", "develop"]
    paths: ["Backend/**"]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Backend

    steps:
      - name: Baixar o código do repositório
        uses: actions/checkout@v4

      - name: Configurar o Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
          cache-dependency-path: Backend/package-lock.json

      - name: Instalar dependências
        run: npm ci

      - name: Rodar lint (se configurado)
        run: npm run lint --if-present

      - name: Rodar testes com cobertura
        run: npm run test:coverage
        env:
          JWT_SECRET: segredo-de-ci
          # dbUrl não é necessário aqui: os testes de unidade usam mocks (Aula 3)
          # e os de integração sobem seu próprio MongoDB em memória (Aula 4) —
          # nenhum dos dois depende do MongoDB Atlas real.

      - name: Publicar relatório de cobertura como artefato
        uses: actions/upload-artifact@v4
        with:
          name: backend-coverage-report
          path: Backend/coverage/
```

**Explicando linha a linha, para a aula:**
- `on: push / pull_request` com `paths: ["Backend/**"]` → o workflow só roda quando algo dentro de `Backend/` muda (evita rodar testes de Backend por causa de um ajuste de CSS no Frontend).
- `actions/checkout@v4` → baixa o código do repositório dentro da máquina virtual do GitHub Actions.
- `actions/setup-node@v4` com `cache: "npm"` → instala o Node na versão certa e **cacheia** o `node_modules` entre execuções, deixando o CI mais rápido.
- `npm ci` (não `npm install`) → instala exatamente as versões travadas no `package-lock.json`, sem surpresas. É o comando recomendado para ambientes de CI.
- O `test:coverage` já falha o processo (`exit code` ≠ 0) se os `coverageThreshold` da Aula 8.3 não forem atingidos — e um `exit code` de erro faz o **GitHub Actions marcar o workflow como falho automaticamente**, sem nenhuma configuração extra.
- `upload-artifact` guarda o relatório HTML de cobertura, para qualquer pessoa do time baixar e conferir depois, direto pela interface do GitHub.

#### 8.5.2 Protegendo a branch principal

Mostre ao aluno, na interface do GitHub (**Settings → Branches → Branch protection rules**), como marcar o workflow `Backend CI` como **obrigatório** antes de permitir merge em `main`. Esse é o ponto em que "ter testes" vira, de fato, "ter qualidade garantida" — ninguém consegue mais integrar código que quebra os testes sem que o time perceba.

#### 8.5.3 E os testes de Sistema e de Carga (Aulas 6 e 7)?

Testes de sistema (Docker + Mongo real) e de carga (k6) são **lentos** e, no caso da carga, propositalmente **estressam** o servidor — não fazem sentido rodando em todo `push`. A prática comum do mercado:

- Testes de **unidade** e **integração** → rodam no CI a **cada push/PR** (rápidos, baratos, bloqueiam o merge).
- Testes de **sistema/E2E** → rodam no CI, mas só em pushes para `main`/`develop`, ou em um job separado, mais lento.
- Testes de **carga** → rodam **agendados** (ex: toda madrugada) ou disparados manualmente antes de um lançamento importante, nunca a cada commit.

Exemplo de workflow agendado para o teste de carga, `Backend/.github/workflows/backend-load-test.yml`:

```yaml
name: Backend Load Test (k6)

on:
  schedule:
    - cron: "0 3 * * *"   # todo dia às 03:00 UTC
  workflow_dispatch:        # também pode ser disparado manualmente pela interface do GitHub

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Instalar o k6
        uses: grafana/setup-k6-action@v1
      - name: Subir o Backend em segundo plano
        working-directory: Backend
        run: |
          npm ci
          npm run dev &
          sleep 5
        env:
          JWT_SECRET: segredo-de-ci
          dbUrl: ${{ secrets.MONGO_URL_STAGING }}
      - name: Rodar o teste de carga
        working-directory: Backend
        run: k6 run load-tests/listar-produtos.js
```

> **Ponto pedagógico — `secrets`:** note o uso de `${{ secrets.MONGO_URL_STAGING }}`. Segredos (senhas, connection strings) **nunca** vão escritos direto no YAML — ficam guardados em **Settings → Secrets and variables → Actions** do repositório no GitHub, e são injetados como variável de ambiente só durante a execução.

### 8.6 Fechando o bloco Backend

Revisão em aula, conectando tudo:

```
Unidade (Aulas 2-3)  →  testam funções e controllers isolados, rápido
Integração (Aulas 4-5) → testam rota + banco reais (em memória), médio
Sistema (Aula 6)     →  testa o backend publicado, caixa-preta, lento
Carga (Aula 7)       →  mede desempenho sob uso real
Coverage (Aula 8)    →  mede o quanto de tudo isso está sendo exercitado
CI/CD (Aula 8.5)     →  garante que tudo isso roda sozinho, a cada mudança
```

### Tarefa final do bloco Backend
Rodar `npm run test:coverage` e entregar um relatório em texto: quais arquivos estão abaixo de 70% e qual teste (unidade ou integração) resolveria cada lacuna. Além disso, subir o workflow `backend-ci.yml` para um repositório no GitHub e anexar ao relatório o link (ou print) da execução do Actions passando.

---

# PARTE B — FRONTEND (Aulas 9 a 16)

## Aula 9 — Setup do ambiente de testes Frontend

### Objetivo da aula
Preparar o `Frontend` (Vite + React) para testes, entendendo por que testar interface é diferente de testar uma API.

### 9.1 Por que as ferramentas mudam no Frontend

No Backend testamos **entrada e saída de dados** (JSON, HTTP). No Frontend testamos **o que o usuário vê e faz** — cliques, digitação, texto na tela. Por isso usamos:

- **Vitest**: mesmo motor de testes do Vite (o projeto já usa Vite), roda tudo mais rápido que Jest num projeto Vite.
- **React Testing Library (RTL)**: renderiza componentes React "de verdade" num DOM simulado e permite buscar elementos **do jeito que um usuário enxergaria** (por texto, por rótulo, por papel/role) — não por detalhes internos de implementação.
- **jsdom**: simula um navegador dentro do Node, para o Vitest ter um `document`/`window`.
- **@testing-library/user-event**: simula interações reais do usuário (clicar, digitar, "tab") de forma mais fiel que disparar eventos manualmente.

### 9.2 Instalando

Dentro de `Frontend/`:

```bash
npm install --save-dev vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### 9.3 Configurando o Vitest

Em `Frontend/vite.config.js`, adicione o bloco `test`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
  },
});
```

Crie `Frontend/src/test/setup.js`:

```js
import "@testing-library/jest-dom/vitest";
```

> Esse arquivo estende o `expect` do Vitest com asserções específicas de DOM, como `toBeInTheDocument()`, `toHaveTextContent()`, `toBeDisabled()`.

Em `Frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### 9.4 Primeiro teste — validando a instalação

`Frontend/src/App.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renderiza sem quebrar", () => {
    render(<App />);
    // a Navbar sempre aparece, em qualquer rota
    expect(screen.getByText("Mynds")).toBeInTheDocument();
  });
});
```

```bash
npm test
```

**Ponto pedagógico — `screen`:** ao invés de guardar o retorno de `render()` e navegar manualmente pelo DOM, o RTL disponibiliza `screen`, que representa "o que está na tela agora" — reforçando a filosofia de testar pela perspectiva do usuário.

### Tarefa de casa da Aula 9
Rodar `npm test -- --ui` (interface visual do Vitest) e explorar o painel — vamos usá-lo bastante nas próximas aulas.

---

## Aula 10 — Testes de Unidade I: funções puras e componentes apresentacionais

### Objetivo da aula
Testar a função utilitária mais simples do projeto e componentes que só recebem `props` e desenham algo na tela (sem estado próprio).

### 10.1 Testando uma função pura: `FormatarData`

Arquivo real do projeto — `Frontend/src/fn-helpers/FormatDate.jsx`:

```jsx
export function FormatarData(data){
  const brasilDateTime = formatDateTime(data)
  return brasilDateTime
}

function formatDateTime(data){
  const dateObj = new Date(data);
  const day = dateObj.getUTCDate().toString().padStart(2,"0");
  const month = (dateObj.getUTCMonth() + 1).toString().padStart(2,"0");
  const year = dateObj.getUTCFullYear().toString();
  const hours = dateObj.getUTCHours().toString().padStart(2,"0");
  const minutes = dateObj.getUTCMinutes().toString().padStart(2,"0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
```

`Frontend/src/fn-helpers/FormatDate.test.jsx`:

```jsx
import { describe, it, expect } from "vitest";
import { FormatarData } from "./FormatDate";

describe("FormatarData()", () => {
  it("formata uma data ISO para dd/mm/aaaa hh:mm", () => {
    expect(FormatarData("2026-05-14T21:10:00.000Z")).toBe("14/05/2026 21:10");
  });

  it("preenche com zero à esquerda quando dia/mês/hora são menores que 10", () => {
    expect(FormatarData("2026-01-05T03:05:00.000Z")).toBe("05/01/2026 03:05");
  });
});
```

**Ponto pedagógico:** essa é a única função verdadeiramente pura do Frontend hoje — uma ótima ponte com a Aula 2 do Backend, mostrando que o conceito de "unidade" é **o mesmo**, independente da camada.

### 10.2 Testando um componente sem estado: `CategoryCard`

Arquivo real — `Frontend/src/components/CategoryCard/CategoryCard.jsx` recebe `icon`, `label`, `count`, `active`, `accent`, `onClick` via `props` e apenas renderiza.

`Frontend/src/components/CategoryCard/CategoryCard.test.jsx`:

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryCard from "./CategoryCard";

describe("CategoryCard", () => {
  it("mostra o rótulo e a contagem recebidos via props", () => {
    render(<CategoryCard icon={<span>🏷️</span>} label="Masculino" count={3} onClick={() => {}} />);

    expect(screen.getByText("Masculino")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("aplica a classe 'active' quando a prop active é verdadeira", () => {
    render(<CategoryCard label="Todos" count={5} active onClick={() => {}} />);

    expect(screen.getByRole("button", { name: /todos/i })).toHaveClass("active");
  });

  it("chama onClick quando o usuário clica no card", async () => {
    const aoClicar = vi.fn();
    const user = userEvent.setup();
    render(<CategoryCard label="Feminino" count={1} onClick={aoClicar} />);

    await user.click(screen.getByRole("button", { name: /feminino/i }));

    expect(aoClicar).toHaveBeenCalledTimes(1);
  });
});
```

**Ponto pedagógico — `vi.fn()`:** é o equivalente, no Vitest, do `jest.fn()` que já usamos no Backend. Cria uma função "espiã" que registra quantas vezes foi chamada e com quais argumentos — sem precisar de uma implementação real de `onClick`.

### 10.3 Testando `Product`, um componente um pouco mais completo

`Frontend/src/components/Product/Product.jsx` recebe um produto inteiro via `props` (spread `{...n}` feito em `ProductPage`).

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Product from "./Product";

const produtoFake = {
  _id: "1",
  name: "Camiseta Azul",
  mark: "Mynds",
  color: "Azul",
  description: "Camiseta 100% algodão",
  price: 59.9,
  type: "masculino",
  releaseDate: "2026-05-14T00:00:00.000Z",
};

describe("Product", () => {
  it("exibe nome, marca, cor, preço formatado e categoria", () => {
    render(<Product {...produtoFake} setEditMode={() => {}} deleteProduct={() => {}} />);

    expect(screen.getByText("Camiseta Azul")).toBeInTheDocument();
    expect(screen.getByText(/Mynds/)).toBeInTheDocument();
    expect(screen.getByText("R$ 59.90")).toBeInTheDocument();
    expect(screen.getByText("Masculino")).toBeInTheDocument();
  });

  it("chama deleteProduct com o _id correto ao clicar em excluir", async () => {
    const aoDeletar = vi.fn();
    const user = userEvent.setup();
    render(<Product {...produtoFake} setEditMode={() => {}} deleteProduct={aoDeletar} />);

    await user.click(screen.getByRole("button", { name: /excluir produto/i }));

    expect(aoDeletar).toHaveBeenCalledWith("1");
  });

  it("chama setEditMode com o produto inteiro ao clicar em editar", async () => {
    const aoEditar = vi.fn();
    const user = userEvent.setup();
    render(<Product {...produtoFake} setEditMode={aoEditar} deleteProduct={() => {}} />);

    await user.click(screen.getByRole("button", { name: /editar produto/i }));

    expect(aoEditar).toHaveBeenCalledWith(expect.objectContaining({ _id: "1", name: "Camiseta Azul" }));
  });
});
```

> **Observação para o professor:** os botões de editar/excluir do `Product.jsx` têm `aria-label="Editar produto"` e `aria-label="Excluir produto"` — foi assim que projetamos o componente. É um ótimo gancho para explicar **acessibilidade** e **testabilidade caminham juntas**: um bom `aria-label` ajuda leitores de tela *e* torna o elemento fácil de localizar em teste (`getByRole("button", { name: ... })`).

### Tarefa de casa da Aula 10
Escrever o teste de `Product` para o caso em que **não há `imageUrl`** — verificando que o placeholder com o ícone da categoria aparece no lugar da tag `<img>`.

---

## Aula 11 — Testes de Unidade II: componentes com estado e interação

### Objetivo da aula
Testar componentes que têm `useState` interno e reagem à digitação/clique do usuário — sem ainda envolver chamadas de rede.

### 11.1 Testando `AddNewButton` (hover como estado)

`Frontend/src/components/UI/AddNewButton/AddNewButton.jsx` alterna um texto conforme o mouse entra/sai.

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddNewButton from "./AddNewButton";

describe("AddNewButton", () => {
  it("mostra apenas '+' antes do hover", () => {
    render(<AddNewButton abrirOModal={() => {}} />);
    expect(screen.getByText("+")).toBeInTheDocument();
  });

  it("mostra o texto completo ao passar o mouse por cima", async () => {
    const user = userEvent.setup();
    render(<AddNewButton abrirOModal={() => {}} />);

    await user.hover(screen.getByText("+"));

    expect(screen.getByText("Adicionar um produto")).toBeInTheDocument();
  });

  it("chama abrirOModal ao clicar", async () => {
    const aoAbrir = vi.fn();
    const user = userEvent.setup();
    render(<AddNewButton abrirOModal={aoAbrir} />);

    await user.click(screen.getByText("+"));

    expect(aoAbrir).toHaveBeenCalledTimes(1);
  });
});
```

### 11.2 Testando `LoginForm` — formulário controlado

`Frontend/src/components/LoginForm/LoginForm.jsx` guarda `email`/`password` em `useState` e chama `props.loginHook(user)` no submit.

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm";

describe("LoginForm", () => {
  it("atualiza os campos conforme o usuário digita", async () => {
    const user = userEvent.setup();
    render(<LoginForm loginHook={() => {}} />);

    const campoEmail = screen.getByPlaceholderText("Email");
    await user.type(campoEmail, "aluno@mynds.com");

    expect(campoEmail).toHaveValue("aluno@mynds.com");
  });

  it("chama loginHook com email e senha ao enviar o formulário", async () => {
    const aoLogar = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm loginHook={aoLogar} />);

    await user.type(screen.getByPlaceholderText("Email"), "aluno@mynds.com");
    await user.type(screen.getByPlaceholderText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(aoLogar).toHaveBeenCalledWith({ email: "aluno@mynds.com", password: "123456" });
  });

  it("não permite enviar o formulário com o e-mail vazio (validação nativa do input required)", async () => {
    const aoLogar = vi.fn();
    const user = userEvent.setup();
    render(<LoginForm loginHook={aoLogar} />);

    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(aoLogar).not.toHaveBeenCalled();
  });
});
```

> **Ponto pedagógico — testando validação HTML nativa:** o campo de e-mail tem `required`. O jsdom respeita essa validação básica do navegador, então o `submit` nem chega a disparar. É uma boa hora para lembrar o aluno que **nem toda validação precisa de JavaScript** — e que ainda assim é testável.

### 11.3 Testando `RegisterForm` — múltiplos campos e tipos diferentes

```jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "./RegisterForm";

describe("RegisterForm", () => {
  it("envia todos os campos preenchidos para registerHook", async () => {
    const aoRegistrar = vi.fn();
    const user = userEvent.setup();
    render(<RegisterForm registerHook={aoRegistrar} />);

    await user.type(screen.getByPlaceholderText("Nome"), "Aluno Teste");
    await user.type(screen.getByPlaceholderText("Email"), "aluno@mynds.com");
    await user.type(screen.getByPlaceholderText("Idade"), "21");
    await user.type(screen.getByPlaceholderText("Senha"), "123456");
    await user.type(screen.getByPlaceholderText("Confirmar senha"), "123456");
    await user.click(screen.getByRole("button", { name: /registrar/i }));

    expect(aoRegistrar).toHaveBeenCalledWith({
      name: "Aluno Teste",
      email: "aluno@mynds.com",
      age: 21,
      password: "123456",
      confirmPassword: "123456",
    });
  });
});
```

### Tarefa de casa da Aula 11
Escrever um teste para `Form.jsx` (o formulário de produto usado dentro do `Modal`) verificando que, ao passar `editingProduct` como prop, os campos já nascem preenchidos com os dados do produto (esse é exatamente o comportamento que corrigimos na Aula de refatoração do projeto — bom gancho para revisão).

---

## Aula 12 — Testes de Integração I: mock de API com MSW

### Objetivo da aula
Testar uma tela inteira (`ProductPage`) que **fala com uma API de verdade via `axios`**, sem depender do backend estar rodando — usando o **Mock Service Worker (MSW)** para interceptar as chamadas de rede.

### 12.1 Por que MSW e não mockar o `axios` direto?

Poderíamos usar `vi.mock("axios")`, mas isso testa "será que eu chamei `axios.get` certo?" — muito próximo da implementação. O MSW intercepta a requisição **na camada de rede**, então o componente é testado exatamente como se estivesse falando com um servidor de verdade: isso é o que caracteriza um teste de **integração** (várias peças reais conectadas, só o "backend" é substituído).

### 12.2 Instalando e configurando

```bash
npm install --save-dev msw
```

`Frontend/src/test/server.js`:

```js
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

`Frontend/src/test/handlers.js`:

```js
import { http, HttpResponse } from "msw";

const produtosFake = [
  { _id: "1", name: "Camiseta Azul", mark: "Mynds", color: "Azul", description: "Básica", price: 59.9, type: "masculino", releaseDate: "2026-05-14T00:00:00.000Z" },
  { _id: "2", name: "Vestido Floral", mark: "Mynds", color: "Rosa", description: "Verão", price: 129.9, type: "feminino", releaseDate: "2026-05-10T00:00:00.000Z" },
];

export const handlers = [
  http.get("http://localhost:4444/products/", () => {
    return HttpResponse.json({ products: produtosFake });
  }),

  http.post("http://localhost:4444/products/create-product", async ({ request }) => {
    const novoProduto = await request.json();
    return HttpResponse.json({
      message: "Produto criado com sucesso!",
      data: { _id: "3", ...novoProduto },
    });
  }),

  http.delete("http://localhost:4444/products/delete-product/:id", () => {
    return HttpResponse.json({ message: "Deletado com sucesso!" });
  }),
];
```

Atualize `Frontend/src/test/setup.js` para ligar/desligar o servidor mock em volta de cada suíte de testes:

```js
import "@testing-library/jest-dom/vitest";
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./server";

beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### 12.3 Testando `ProductPage` de ponta a ponta (dentro do Frontend)

Como `ProductPage` usa `useNavigate` do React Router, precisamos envolvê-la num `MemoryRouter`:

```jsx
import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import ProductPage from "./ProductPage";

function renderComRouter(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe("ProductPage (integração com API mockada)", () => {
  it("carrega e exibe os produtos vindos da API", async () => {
    renderComRouter(<ProductPage />);

    expect(await screen.findByText("Camiseta Azul")).toBeInTheDocument();
    expect(screen.getByText("Vestido Floral")).toBeInTheDocument();
  });

  it("filtra os produtos ao clicar no card de categoria 'Feminino'", async () => {
    const user = userEvent.setup();
    renderComRouter(<ProductPage />);

    await screen.findByText("Camiseta Azul");
    await user.click(screen.getByRole("button", { name: /feminino/i }));

    expect(screen.queryByText("Camiseta Azul")).not.toBeInTheDocument();
    expect(screen.getByText("Vestido Floral")).toBeInTheDocument();
  });

  it("exibe a mensagem de vazio quando o filtro não encontra nenhum produto", async () => {
    const user = userEvent.setup();
    renderComRouter(<ProductPage />);

    await screen.findByText("Camiseta Azul");
    await user.click(screen.getByRole("button", { name: /^outros/i }));

    expect(await screen.findByText(/nenhum produto encontrado/i)).toBeInTheDocument();
  });
});
```

**Ponto pedagógico — `findBy*` × `getBy*`:** `findByText` espera (de forma assíncrona) o elemento aparecer — essencial aqui porque os produtos chegam depois de uma chamada de rede (mesmo mockada, ainda é assíncrona). `getByText` falha imediatamente se não encontrar; `queryByText` retorna `null` ao invés de lançar erro, ótimo para afirmar que **algo não está na tela**.

### 12.4 Testando a criação de produto (exige login)

```jsx
it("bloqueia a criação de produto e redireciona quando não há token salvo", async () => {
  const alertOriginal = window.alert;
  window.alert = () => {};
  localStorage.removeItem("token");

  const user = userEvent.setup();
  renderComRouter(<ProductPage />);

  await screen.findByText("Camiseta Azul");
  await user.click(screen.getByRole("button", { name: "+" }));
  await user.click(screen.getByText(/adicionar produto/i));

  // como não há Form aberto (usuário foi bloqueado antes do modal abrir), garantimos que ele nunca aparece
  expect(screen.queryByText(/adicionar produto\./i)).not.toBeInTheDocument();

  window.alert = alertOriginal;
});
```

> Esse teste é uma boa oportunidade para discutir com o aluno **efeitos colaterais do navegador** (`window.alert`, `localStorage`) e como "tampá-los" durante os testes.

### Tarefa de casa da Aula 12
Adicionar um handler no MSW para simular o backend respondendo **erro 500** em `GET /products/`, e escrever um teste garantindo que a tela não quebra (mesmo que hoje ela só dê um `console.log` do erro — perceber essa limitação de UX é parte do aprendizado).

---

## Aula 13 — Testes de Integração II: roteamento e autenticação

### Objetivo da aula
Testar como as telas **conversam através do roteador** e do `localStorage` — o "cimento" que junta Navbar, AuthPage e ProductPage.

### 13.1 Testando a `Navbar` de acordo com o estado de login

`Frontend/src/components/UI/Navbar/Navbar.jsx` decide o que mostrar com base em `localStorage.getItem("token")`.

```jsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

describe("Navbar", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("mostra o link 'Login' quando não há token salvo", () => {
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("mostra o botão 'Sair' quando há um token salvo", () => {
    localStorage.setItem("token", "token-falso");
    render(<MemoryRouter><Navbar /></MemoryRouter>);
    expect(screen.getByRole("button", { name: /sair/i })).toBeInTheDocument();
  });

  it("remove o token e navega para /auth ao clicar em Sair", async () => {
    const userEvent = (await import("@testing-library/user-event")).default;
    const user = userEvent.setup();
    localStorage.setItem("token", "token-falso");

    render(<MemoryRouter initialEntries={["/products"]}><Navbar /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: /sair/i }));

    expect(localStorage.getItem("token")).toBeNull();
  });
});
```

### 13.2 Testando `AuthPage`: login com sucesso navega, erro mostra mensagem

Aqui usamos o MSW (Aula 12) para simular o backend de autenticação:

`Frontend/src/test/handlers.js` (adicionando handlers de auth):

```js
http.post("http://localhost:4444/auth/login", async ({ request }) => {
  const { email, password } = await request.json();
  if (email === "aluno@mynds.com" && password === "123456") {
    return HttpResponse.json({ token: "token-de-teste" });
  }
  return HttpResponse.json({ message: "Senha incorreta!" }, { status: 401 });
}),
```

`Frontend/src/pages/AuthPage/AuthPage.test.jsx`:

```jsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "./AuthPage";

describe("AuthPage — login", () => {
  beforeEach(() => localStorage.clear());

  it("mostra mensagem de erro quando o login falha", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AuthPage /></MemoryRouter>);

    await user.click(screen.getByText(/já tem conta/i));
    await user.type(screen.getByPlaceholderText("Email"), "aluno@mynds.com");
    await user.type(screen.getByPlaceholderText("Senha"), "senhaerrada");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText("Senha incorreta!")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
  });

  it("salva o token e redireciona para /products quando o login é bem-sucedido", async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><AuthPage /></MemoryRouter>);

    await user.click(screen.getByText(/já tem conta/i));
    await user.type(screen.getByPlaceholderText("Email"), "aluno@mynds.com");
    await user.type(screen.getByPlaceholderText("Senha"), "123456");
    await user.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => expect(localStorage.getItem("token")).toBe("token-de-teste"));
  });
});
```

> **Nota:** para o `waitFor` funcionar, importe-o de `@testing-library/react`. Esse teste **não** consegue verificar visualmente que a navegação para `/products` aconteceu (o `MemoryRouter` sozinho não renderiza o destino sem as rotas completas) — para isso, existe uma técnica mais avançada com `createMemoryRouter` + `RouterProvider`, ótima como desafio extra para os alunos mais adiantados.

### 13.3 Helper de teste reutilizável (boas práticas)

Para não repetir o `<MemoryRouter>` em todo teste, crie `Frontend/src/test/renderComProviders.jsx`:

```jsx
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export function renderComProviders(ui, { rota = "/" } = {}) {
  return render(<MemoryRouter initialEntries={[rota]}>{ui}</MemoryRouter>);
}
```

E os testes passam a usar:

```jsx
renderComProviders(<AuthPage />, { rota: "/auth" });
```

### Tarefa de casa da Aula 13
Escrever o teste de `RegisterForm` integrado à `AuthPage`: registrar com sucesso deve mostrar a mensagem de sucesso **e** trocar automaticamente para a tela de login (comportamento implementado em `AuthPage.jsx`).

---

## Aula 14 — Testes de Sistema / E2E com Playwright

### Objetivo da aula
Testar o Mynds **rodando de verdade no navegador** — Frontend (`localhost:5173`) conversando com o Backend (`localhost:4444`) real, exatamente como um usuário usaria.

### 14.1 Integração × Sistema, agora no Frontend

Nas Aulas 12-13, o "backend" era **fingido** pelo MSW. Aqui, tanto o Frontend quanto o Backend estão **de pé, de verdade**, e um navegador automatizado (Chromium/Firefox) interage com a página real. Isso é teste de **sistema** (ou E2E — *end-to-end*, ponta a ponta).

### 14.2 Instalando o Playwright

Numa pasta separada, `Frontend/e2e/` (ou na raiz do projeto — discuta com a turma qual faz mais sentido):

```bash
npm install --save-dev @playwright/test
npx playwright install
```

`Frontend/playwright.config.js`:

```js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
    screenshot: "only-on-failure",
  },
});
```

> **Pré-requisito explicado em aula:** antes de rodar os testes E2E, o aluno precisa ter **os dois servidores no ar** (`npm run dev` no Backend e no Frontend, em dois terminais). Isso reforça, na prática, a diferença de "sistema" para os testes anteriores.

### 14.3 Padrão Page Object Model (POM)

Ao invés de espalhar seletores CSS pelos testes, criamos "objetos de página" que sabem como interagir com cada tela:

`Frontend/e2e/pages/AuthPage.js`:

```js
export class AuthPageObject {
  constructor(page) {
    this.page = page;
  }

  async irParaTelaDeLogin() {
    await this.page.goto("/auth");
    await this.page.getByText("Já tem conta? Ir para login").click();
  }

  async logar(email, senha) {
    await this.page.getByPlaceholder("Email").fill(email);
    await this.page.getByPlaceholder("Senha").fill(senha);
    await this.page.getByRole("button", { name: "Entrar" }).click();
  }
}
```

### 14.4 Teste E2E: fluxo completo do usuário

`Frontend/e2e/fluxo-produto.spec.js`:

```js
import { test, expect } from "@playwright/test";
import { AuthPageObject } from "./pages/AuthPage.js";

test.describe("Fluxo completo: registrar, logar, cadastrar e filtrar produto", () => {
  test("usuário consegue criar conta, logar e cadastrar um produto", async ({ page }) => {
    const email = `e2e-${Date.now()}@mynds.com`;

    // 1. Registro
    await page.goto("/auth");
    await page.getByPlaceholder("Nome").fill("Aluno E2E");
    await page.getByPlaceholder("Email").fill(email);
    await page.getByPlaceholder("Idade").fill("22");
    await page.getByPlaceholder("Senha").fill("123456");
    await page.getByPlaceholder("Confirmar senha").fill("123456");
    await page.getByRole("button", { name: "Registrar" }).click();

    await expect(page.getByText("Conta criada com sucesso!")).toBeVisible();

    // 2. Login (a tela já troca sozinha para login após o registro)
    const auth = new AuthPageObject(page);
    await auth.logar(email, "123456");

    await expect(page).toHaveURL(/\/products$/);

    // 3. Cadastrar produto
    await page.getByRole("button", { name: "+" }).click();
    await page.getByPlaceholder("Nome do produto").fill("Boné E2E");
    await page.getByPlaceholder("Marca do produto").fill("Mynds");
    await page.getByPlaceholder("Cor do produto").fill("Preto");
    await page.getByPlaceholder("Preço do produto").fill("39.90");
    await page.getByRole("button", { name: "Criar produto." }).click();

    await expect(page.getByText("Boné E2E")).toBeVisible();

    // 4. Filtrar por categoria "Outros" (categoria padrão do formulário)
    await page.getByRole("button", { name: /^outros/i }).click();
    await expect(page.getByText("Boné E2E")).toBeVisible();

    // 5. Logout
    await page.getByRole("button", { name: "Sair" }).click();
    await expect(page).toHaveURL(/\/auth$/);
  });
});
```

Rodando:

```bash
npx playwright test
```

### 14.5 Testes Funcionais E2E com dados realistas (Faker.js)

Até aqui, os testes E2E usaram dados fixos (`"Aluno E2E"`, `"Boné E2E"`) ou um e-mail montado na mão com `Date.now()`. Isso funciona, mas tem dois problemas que valem a pena discutir com a turma:

1. **Dados repetidos** entre execuções podem colidir (ex: e-mail duplicado, se o `Date.now()` não mudar o suficiente em testes muito rápidos em paralelo).
2. **Dados "de mentirinha demais"** (`"teste123"`) não representam bem o uso real — um nome de verdade, um preço com centavos variados, uma cor aleatória ajudam a pegar bugs que só aparecem com dados "do mundo real" (acentuação, tamanhos de texto variados, etc.).

O **Faker.js** resolve isso: gera dados falsos, porém **realistas e sempre diferentes** a cada execução — nomes, e-mails, preços, cores, datas, parágrafos de descrição.

#### 14.5.1 Instalando

```bash
npm install --save-dev @faker-js/faker
```

#### 14.5.2 Criando uma "fábrica" de dados de teste (test data factory)

`Frontend/e2e/factories/usuario.factory.js`:

```js
import { faker } from "@faker-js/faker";

export function criarUsuarioFake(overrides = {}) {
  const senha = "Senha@123";

  return {
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 65 }),
    email: faker.internet.email().toLowerCase(),
    password: senha,
    confirmPassword: senha,
    ...overrides,
  };
}
```

`Frontend/e2e/factories/produto.factory.js`:

```js
import { faker } from "@faker-js/faker";

export function criarProdutoFake(overrides = {}) {
  return {
    name: faker.commerce.productName(),
    mark: faker.company.name(),
    color: faker.color.human(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price({ min: 10, max: 500 }),
    type: faker.helpers.arrayElement(["masculino", "feminino", "outros"]),
    ...overrides,
  };
}
```

**Ponto pedagógico — por que uma "fábrica" (`factory`) e não chamar o `faker` direto no teste?** Centralizar a criação dos dados em uma função:
- Evita repetir `faker.person.fullName()` em 10 testes diferentes.
- Permite sobrescrever só o campo que importa para aquele teste específico (`overrides`), mantendo o resto aleatório — por exemplo, um teste sobre "e-mail inválido" só precisa fixar o `email`, o resto pode continuar realista e aleatório.

#### 14.5.3 Reescrevendo o teste E2E da Aula 14.4 com Faker

`Frontend/e2e/fluxo-produto-faker.spec.js`:

```js
import { test, expect } from "@playwright/test";
import { AuthPageObject } from "./pages/AuthPage.js";
import { criarUsuarioFake } from "./factories/usuario.factory.js";
import { criarProdutoFake } from "./factories/produto.factory.js";

test.describe("Fluxo completo com dados gerados por Faker", () => {
  test("usuário aleatório consegue registrar, logar e cadastrar um produto aleatório", async ({ page }) => {
    const usuario = criarUsuarioFake();
    const produto = criarProdutoFake({ type: "outros" }); // fixamos o tipo pois é o que o formulário assume por padrão

    // 1. Registro com dados 100% gerados pelo Faker
    await page.goto("/auth");
    await page.getByPlaceholder("Nome").fill(usuario.name);
    await page.getByPlaceholder("Email").fill(usuario.email);
    await page.getByPlaceholder("Idade").fill(String(usuario.age));
    await page.getByPlaceholder("Senha").fill(usuario.password);
    await page.getByPlaceholder("Confirmar senha").fill(usuario.confirmPassword);
    await page.getByRole("button", { name: "Registrar" }).click();

    await expect(page.getByText("Conta criada com sucesso!")).toBeVisible();

    // 2. Login
    const auth = new AuthPageObject(page);
    await auth.logar(usuario.email, usuario.password);
    await expect(page).toHaveURL(/\/products$/);

    // 3. Cadastro de produto com dados gerados
    await page.getByRole("button", { name: "+" }).click();
    await page.getByPlaceholder("Nome do produto").fill(produto.name);
    await page.getByPlaceholder("Marca do produto").fill(produto.mark);
    await page.getByPlaceholder("Cor do produto").fill(produto.color);
    await page.getByPlaceholder("Descrição do produto").fill(produto.description);
    await page.getByPlaceholder("Preço do produto").fill(String(produto.price));
    await page.getByRole("button", { name: "Criar produto." }).click();

    await expect(page.getByText(produto.name)).toBeVisible();
  });
});
```

> **Discussão em aula:** rode esse teste **várias vezes seguidas** e mostre ao aluno que os dados mudam a cada execução (nomes, cores, preços diferentes) — mas o comportamento validado (`expect`) continua o mesmo. Isso é a essência de um bom teste funcional E2E: validar **comportamento**, não um valor mágico fixo.

#### 14.5.4 Faker também no Backend (integração e sistema)

O mesmo princípio vale para os testes de integração/sistema do Backend (Aulas 4, 5 e 6) — é um ótimo momento para voltar e mostrar a conexão entre os blocos:

```bash
npm install --save-dev @faker-js/faker
```

`Backend/src/test-utils/factories.js`:

```js
import { faker } from "@faker-js/faker";

export function criarPayloadDeRegistro(overrides = {}) {
  const senha = faker.internet.password({ length: 10 });
  return {
    name: faker.person.fullName(),
    age: faker.number.int({ min: 18, max: 65 }),
    email: faker.internet.email().toLowerCase(),
    password: senha,
    confirmPassword: senha,
    ...overrides,
  };
}

export function criarPayloadDeProduto(overrides = {}) {
  return {
    name: faker.commerce.productName(),
    mark: faker.company.name(),
    color: faker.color.human(),
    description: faker.commerce.productDescription(),
    price: Number(faker.commerce.price({ min: 10, max: 500 })),
    type: faker.helpers.arrayElement(["masculino", "feminino", "outros"]),
    ...overrides,
  };
}
```

Reescrevendo parte do teste de integração da Aula 4 (`POST /auth/register`) usando a fábrica:

```js
import { criarPayloadDeRegistro } from "../test-utils/factories.js";

it("cria um usuário novo e retorna 200 (com dados gerados por Faker)", async () => {
  const payload = criarPayloadDeRegistro();

  const resposta = await request(app).post("/auth/register").send(payload);

  expect(resposta.status).toBe(200);
  expect(resposta.body.data.email).toBe(payload.email);
  expect(resposta.body.data.password).not.toBe(payload.password);
});
```

**Ponto pedagógico — Faker não substitui casos de borda:** deixe claro para o aluno que Faker é ótimo para o "caminho feliz" e para gerar volume de dados variados (útil também no Aula 7, para popular o banco antes de um teste de carga). Mas casos de borda propositais — senha vazia, e-mail inválido, idade negativa — **continuam precisando ser escritos manualmente**, como fizemos na Aula 2, porque são casos específicos que o aluno decide testar, não algo aleatório.

### 14.6 O que só um teste de sistema pega

Discuta em aula: bugs de **CSS quebrando um clique**, **CORS mal configurado**, **variáveis de ambiente erradas em produção**, **relógio do servidor desincronizado afetando o JWT** — nenhum desses aparece em teste de unidade ou integração isolada. Só aparecem quando tudo está rodando junto, de verdade.

### Tarefa de casa da Aula 14
Escrever o cenário E2E de **editar** e **excluir** um produto, reaproveitando o `AuthPageObject` e criando um `ProductPageObject` novo.

---

## Aula 15 — Testes de Aceitação (BDD)

### Objetivo da aula
Entender a diferença entre um teste E2E "técnico" (Aula 14) e um **teste de aceitação**, escrito na linguagem do negócio, que serve como **documentação viva** do que o sistema faz.

### 15.1 Teste de Sistema × Teste de Aceitação — qual a diferença?

| | Sistema/E2E (Aula 14) | Aceitação (esta aula) |
|---|---|---|
| Escrito para | desenvolvedores | desenvolvedores **e** stakeholders/PO/cliente |
| Foco | "o clique no botão X leva à tela Y" | "o cliente consegue comprar um produto" (critério de negócio) |
| Linguagem | código (Playwright puro) | linguagem natural estruturada (Gherkin) |
| Serve como | teste automatizado | teste automatizado **+** especificação/contrato do que foi combinado |

### 15.2 Gherkin: Dado / Quando / Então

Gherkin é uma linguagem estruturada, legível por qualquer pessoa do time (não só programadores), que descreve comportamento em cenários.

`Frontend/e2e/features/cadastro-produto.feature`:

```gherkin
# language: pt
Funcionalidade: Cadastro de produto
  Como um usuário logado
  Eu quero cadastrar um novo produto
  Para que ele apareça na vitrine da loja

  Contexto:
    Dado que estou logado no sistema

  Cenário: Cadastro de produto com sucesso
    Quando eu preencho o formulário de produto com nome "Boné E2E", marca "Mynds", cor "Preto" e preço "39.90"
    E eu confirmo o cadastro
    Então o produto "Boné E2E" deve aparecer na lista de produtos

  Cenário: Tentativa de cadastro sem estar logado
    Dado que eu não estou logado no sistema
    Quando eu tento cadastrar um produto
    Então devo ser redirecionado para a tela de login
```

`Frontend/e2e/features/login.feature`:

```gherkin
# language: pt
Funcionalidade: Autenticação de usuário
  Como um visitante do site
  Eu quero entrar com meu e-mail e senha
  Para acessar a área de produtos

  Cenário: Login com credenciais válidas
    Dado que possuo uma conta cadastrada com o e-mail "aluno@mynds.com" e senha "123456"
    Quando eu faço login com esse e-mail e senha
    Então devo ser levado para a tela de produtos

  Cenário: Login com senha incorreta
    Dado que possuo uma conta cadastrada com o e-mail "aluno@mynds.com" e senha "123456"
    Quando eu faço login com esse e-mail e a senha "senha-errada"
    Então devo ver a mensagem de erro "Senha incorreta!"
```

### 15.3 Conectando o Gherkin ao Playwright (`playwright-bdd`)

```bash
npm install --save-dev playwright-bdd
```

`Frontend/e2e/steps/login.steps.js`:

```js
import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

const { Given, When, Then } = createBdd();

Given("que possuo uma conta cadastrada com o e-mail {string} e senha {string}", async ({ page, request }, email, senha) => {
  // usa a API diretamente para "preparar o cenário" sem precisar testar o registro de novo aqui
  await request.post("http://localhost:4444/auth/register", {
    data: { name: "Fixture BDD", age: 30, email, password: senha, confirmPassword: senha },
  });
});

When("eu faço login com esse e-mail e senha", async ({ page }, email, senha) => {
  await page.goto("/auth");
  await page.getByText("Já tem conta? Ir para login").click();
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Senha").fill(senha);
  await page.getByRole("button", { name: "Entrar" }).click();
});

When("eu faço login com esse e-mail e a senha {string}", async ({ page }, senhaErrada) => {
  await page.goto("/auth");
  await page.getByText("Já tem conta? Ir para login").click();
  await page.getByPlaceholder("Email").fill("aluno@mynds.com");
  await page.getByPlaceholder("Senha").fill(senhaErrada);
  await page.getByRole("button", { name: "Entrar" }).click();
});

Then("devo ser levado para a tela de produtos", async ({ page }) => {
  await expect(page).toHaveURL(/\/products$/);
});

Then("devo ver a mensagem de erro {string}", async ({ page }, mensagem) => {
  await expect(page.getByText(mensagem)).toBeVisible();
});
```

### 15.4 Rodando os testes de aceitação

```bash
npx bddgen
npx playwright test
```

### 15.5 Discussão em aula: critérios de aceitação nascem ANTES do código

O ideal (e o que se pratica em times ágeis reais) é: o Product Owner escreve (ou revisa) o `.feature` **antes** do desenvolvedor programar a funcionalidade. O arquivo Gherkin vira o "contrato" combinado entre negócio e desenvolvimento — e só depois de passar, a funcionalidade é considerada "pronta" (**Definition of Done**).

Peça para os alunos, em duplas, escreverem juntos (um fazendo de "Product Owner", outro de "desenvolvedor") o `.feature` de **"Excluir produto"** antes de implementar os *steps*.

### Tarefa de casa da Aula 15
Implementar os *steps* do cenário "Cadastro de produto" (`cadastro-produto.feature`), reaproveitando o `AuthPageObject`/fixtures da Aula 14.

---

## Aula 16 — Cobertura no Frontend + Revisão Geral do Curso

### Objetivo da aula
Fechar o bloco de Frontend medindo cobertura, e revisar **o curso inteiro** conectando os 6 tipos de teste vistos nas 16 aulas.

### 16.1 Configurando coverage no Vitest

```bash
npm install --save-dev @vitest/coverage-v8
```

Em `vite.config.js`:

```js
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: ["src/main.jsx", "src/test/**", "**/*.test.jsx"],
      thresholds: {
        statements: 70,
        branches: 60,
        functions: 70,
        lines: 70,
      },
    },
  },
});
```

```bash
npm run test:coverage
```

Igual ao Backend (Aula 8): relatório no terminal + pasta `coverage/` com HTML navegável.

### 16.2 O que geralmente fica com cobertura baixa (e por quê)

Discuta com o aluno, olhando o relatório real do projeto:

- `Chat.jsx`/`Join.jsx` — dependem de `socket.io-client` real; exigem mocks do socket (bom desafio extra: `vi.mock("socket.io-client")`).
- `main.jsx` — só sobe a aplicação, geralmente é **excluído** da cobertura (não há o que "testar" ali).
- Caminhos de erro (`catch` de chamadas `axios`) — como vimos na Aula 12, é fácil esquecer de testar o caminho de erro, só o de sucesso.

### 16.3 Revisão geral: os 6 tipos de teste no Mynds, lado a lado

| Tipo | Onde vimos no Backend | Onde vimos no Frontend |
|---|---|---|
| **Unidade** | `soma()`, `senhasConferem()`, controllers com mock (Aulas 2-3) | `FormatarData()`, `CategoryCard`, `LoginForm` (Aulas 10-11) |
| **Integração** | rotas + Mongo em memória, fluxo completo, socket.io (Aulas 4-5) | `ProductPage` + MSW, `AuthPage` + roteamento (Aulas 12-13) |
| **Sistema** | Docker + chamadas HTTP reais, caixa-preta (Aula 6) | Playwright contra Frontend+Backend reais (Aula 14) |
| **Aceitação** | *(pode ser adaptado com Gherkin + supertest, desafio extra)* | Gherkin + `playwright-bdd` (Aula 15) |
| **Carga** | k6 contra a API (Aula 7) | *(desafio extra: Lighthouse/Web Vitals no Frontend)* |
| **Coverage** | Jest `--coverage` (Aula 8) | Vitest `--coverage` (esta aula) |
| **CI/CD** | GitHub Actions rodando lint + testes + coverage a cada push (Aula 8.5) | GitHub Actions (unidade/integração/build) + workflow separado de E2E, e introdução ao CD (Aula 16.4) |

### 16.4 CI/CD: Frontend + pipeline combinado com o Backend

Na Aula 8.5 o Backend ganhou seu workflow de CI. Agora fechamos o ciclo configurando o CI do Frontend e um **pipeline único**, que valida o projeto inteiro (Backend + Frontend) a cada `push`/`pull request` — e damos o primeiro passo em direção ao **CD**.

#### 16.4.1 Workflow de CI do Frontend

`Frontend/.github/workflows/frontend-ci.yml`:

```yaml
name: Frontend CI

on:
  push:
    branches: ["main", "develop"]
    paths: ["Frontend/**"]
  pull_request:
    branches: ["main", "develop"]
    paths: ["Frontend/**"]

jobs:
  test:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Frontend

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "npm"
          cache-dependency-path: Frontend/package-lock.json

      - name: Instalar dependências
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Testes de unidade e integração + cobertura
        run: npm run test:coverage

      - name: Build de produção
        run: npm run build

      - uses: actions/upload-artifact@v4
        with:
          name: frontend-coverage-report
          path: Frontend/coverage/
```

**Ponto pedagógico — por que rodar o `build` no CI, mesmo sem testes de build específicos?** O comando `vite build` faz a checagem final de que todo o código realmente compila para produção (imports quebrados, sintaxe inválida em algum arquivo não coberto por teste, etc. aparecem aqui). É comum considerar "o build passou" como mais um critério de qualidade dentro do CI.

> O job de **E2E/Aceitação** (Playwright, Aula 14 e 15) fica de fora deste workflow rápido pelo mesmo motivo do teste de sistema no Backend (item 8.5.3): ele precisa do Backend **e** do Frontend rodando ao mesmo tempo, é mais lento, e por isso ganha um workflow próprio, rodando com os dois serviços de pé:

`Frontend/.github/workflows/e2e.yml`:

```yaml
name: E2E (Playwright)

on:
  push:
    branches: ["main"]
  workflow_dispatch:

jobs:
  e2e:
    runs-on: ubuntu-latest
    services:
      mongo:
        image: mongo:7
        ports: ["27017:27017"]

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      - name: Subir o Backend
        working-directory: Backend
        run: |
          npm ci
          npm run dev &
          npx wait-on http://localhost:4444/products/
        env:
          dbUrl: mongodb://localhost:27017/mynds-e2e
          JWT_SECRET: segredo-de-ci
          PORT: 4444

      - name: Instalar e rodar o Frontend
        working-directory: Frontend
        run: |
          npm ci
          npm run dev &
          npx wait-on http://localhost:5173

      - name: Instalar navegadores do Playwright
        working-directory: Frontend
        run: npx playwright install --with-deps

      - name: Rodar os testes E2E
        working-directory: Frontend
        run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: Frontend/playwright-report/
```

**Explicando para a turma:**
- `services: mongo` → o GitHub Actions sobe um **container MongoDB de verdade** só para essa execução, do mesmo jeito que o Docker Compose fez na Aula 6.
- `npx wait-on <url>` → espera ativamente até a URL responder, antes de seguir para o próximo passo. Resolve o problema clássico de "o servidor ainda não subiu quando o teste já tentou começar".
- `if: always()` no `upload-artifact` → publica o relatório do Playwright **mesmo quando o teste falha** (é justamente quando mais precisamos dele, com os screenshots de falha configurados na Aula 14).

#### 16.4.2 Do CI ao CD: publicando automaticamente

Depois que o CI garante "o código está correto", o **CD** cuida de publicar essa versão automaticamente. Um exemplo simples, comum no mercado, para o Frontend (build estático) usando o Netlify/Vercel-like via GitHub Pages, apenas para ilustrar o conceito:

```yaml
name: Frontend CD (Deploy)

on:
  push:
    branches: ["main"]
    paths: ["Frontend/**"]

jobs:
  deploy:
    needs: []  # em um pipeline real, isso apontaria para o job de CI, ex: needs: [test]
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: Frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
      - run: npm ci
      - run: npm run build
      - name: Publicar em produção
        run: echo "Aqui entraria o comando da plataforma escolhida (Vercel CLI, rsync para um servidor, docker push, etc.)"
```

O ponto pedagógico mais importante aqui **não é decorar a sintaxe de uma plataforma específica de deploy** — é entender a cadeia de responsabilidade:

```
push no GitHub
   │
   ▼
CI roda lint + testes de unidade/integração + build   ──▶  falhou? PARA AQUI, ninguém é publicado
   │ passou
   ▼
(opcional) E2E roda contra os dois serviços de pé      ──▶  falhou? PARA AQUI
   │ passou
   ▼
CD publica a nova versão automaticamente
```

Use `needs: [test]` (referenciando o nome do job de CI) para garantir, no YAML real do projeto, que o deploy **nunca** roda se o job de teste falhou — essa dependência entre jobs é o coração de todo pipeline de CI/CD.

### 16.5 Script único para rodar tudo (mostrar ao aluno como fecha o ciclo)

`Backend/package.json` e `Frontend/package.json`, resumo dos scripts que o curso construiu:

```jsonc
// Backend/package.json
"scripts": {
  "dev": "nodemon src/server.js",
  "test": "cross-env NODE_ENV=test jest --runInBand",
  "test:coverage": "cross-env NODE_ENV=test jest --coverage",
  "test:load": "k6 run load-tests/listar-produtos.js"
}
```

```jsonc
// Frontend/package.json
"scripts": {
  "dev": "vite",
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "test:e2e": "playwright test"
}
```

### 16.6 Desafio final do curso (avaliação)

Peça ao aluno para entregar, sobre uma funcionalidade nova e pequena que ele mesmo implementar no projeto (ex: "favoritar produto"):

1. Pelo menos **3 testes de unidade**.
2. Pelo menos **2 testes de integração** (1 backend, 1 frontend).
3. **1 cenário de sistema/E2E** cobrindo o caminho feliz.
4. **1 cenário de aceitação** em Gherkin, revisado como se fosse com um "Product Owner".
5. Um script de **carga** simples contra a nova rota, se houver uma.
6. Relatório de **cobertura** antes/depois da funcionalidade, comentando o que ficou descoberto e por quê.
7. Os workflows de **CI** (Backend e Frontend) rodando e passando no GitHub Actions a cada `push` — com print/link da execução verde.

Esse desafio força o aluno a percorrer a pirâmide inteira — do teste mais barato e específico ao mais caro e abrangente — e a fechar o ciclo com automação, exatamente como se espera de um profissional de QA/desenvolvimento no mercado.

---

## Apêndice — Glossário rápido para consulta em aula

- **Mock**: substituto falso e controlável de uma dependência real.
- **Stub**: mock simplificado que só devolve um valor fixo, sem verificar chamadas.
- **Spy**: função real "espiada" — mantém o comportamento original, mas registra chamadas.
- **Fixture**: dado de teste preparado previamente (ex: um usuário já cadastrado).
- **Faker (test data factory)**: biblioteca que gera dados falsos porém realistas (nomes, e-mails, preços) para testes funcionais/E2E, evitando dados fixos repetidos e colisões entre execuções.
- **Flaky test**: teste que às vezes passa, às vezes falha, sem mudança no código — geralmente por depender de tempo, rede ou ordem de execução.
- **Caixa-branca**: teste escrito olhando para dentro da implementação (ex: unidade com mocks).
- **Caixa-preta**: teste escrito sem conhecer a implementação, só entrada/saída (ex: sistema, aceitação).
- **Definition of Done (DoD)**: critério combinado de quando uma funcionalidade é considerada realmente pronta — testes de aceitação passando é um dos critérios mais comuns.
- **CI (Continuous Integration)**: prática de rodar automaticamente lint, testes e build a cada `push`/`pull request`, para pegar problemas o quanto antes.
- **CD (Continuous Delivery/Deployment)**: prática de publicar automaticamente, em produção (ou staging), uma versão que já passou pelo CI.
- **Pipeline**: sequência de etapas automatizadas (ex: lint → testes → build → deploy) que o código percorre do commit até a publicação.
- **Workflow (GitHub Actions)**: arquivo YAML que descreve um pipeline — quando ele roda (`on:`) e o que ele faz (`jobs:`).
- **Job**: um agrupamento de passos (`steps`) dentro de um workflow, executado numa máquina virtual própria (ex: o job `test` e o job `deploy` podem rodar em VMs diferentes).
- **Secret**: valor sensível (senha, chave de API) guardado de forma criptografada nas configurações do repositório, nunca escrito direto no YAML do pipeline.
