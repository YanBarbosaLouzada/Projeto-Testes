# Resumo — Aulas 1 a 7 (Bloco Backend)

Resumo da [APOSTILA-TESTES.md](APOSTILA-TESTES.md), Parte A — Backend do projeto Mynds.

## Visão geral

| # | Aula | Tipo de teste | Ferramentas |
|---|------|---------------|-------------|
| 1 | Setup + Pirâmide de Testes | Fundamentos | Jest, cross-env |
| 2 | Funções puras e utilitárias | Unidade (I) | Jest (`it.each`) |
| 3 | Controllers isolados com mocks | Unidade (II) | `jest.unstable_mockModule` |
| 4 | Rotas HTTP com banco em memória | Integração (I) | Supertest, mongodb-memory-server |
| 5 | Fluxos completos e Socket.io | Integração (II) | Supertest, socket.io-client |
| 6 | Sistema completo, caixa-preta | Sistema | Docker Compose, `fetch` |
| 7 | Performance sob carga | Carga / Performance | k6 |

### A Pirâmide de Testes

```
            /\
           /E2E\         Poucos, lentos, caros (Sistema / Aceitação)
          /------\
         /Integr. \      Um pouco mais
        /----------\
       /  Unidade   \    Muitos, rápidos, baratos
      /--------------\
```

- **Unidade**: testa uma função ou componente sozinho.
- **Integração**: testa se as peças funcionam juntas (rota + controller + banco).
- **Sistema**: testa o sistema inteiro rodando de verdade.
- **Carga** e **Coverage** ficam fora da pirâmide: a carga mede *quão bem* o sistema aguenta uso real, e o coverage mede *quanto* do código os testes exercitam.

---

## Aula 1 — Setup do ambiente + Pirâmide de Testes

**Objetivo:** preparar o Backend para rodar testes e separar "o app" de "o servidor ligado".

**Instalação:**
```bash
npm install --save-dev jest supertest mongodb-memory-server cross-env
```
- **Jest**: o framework de testes (`describe`, `it`, `expect`).
- **Supertest**: faz requisições HTTP ao Express sem abrir uma porta.
- **mongodb-memory-server**: sobe um MongoDB em memória só para os testes.
- **cross-env**: faz o `NODE_ENV=test` funcionar igual no Windows, no Linux e no Mac.

**Pontos-chave:**
- O projeto usa ESM (`"type": "module"`), por isso o Jest roda com `node --experimental-vm-modules`.
- O `jest.config.js` define `testEnvironment: "node"`, `transform: {}`, `testMatch: ["**/*.test.js"]` e `setupFiles: ["dotenv/config"]`.
- **`app.js` × `server.js`**: o `app.js` só monta o Express e o exporta. O `server.js` liga as portas, o Socket.io e o banco. Assim o Supertest usa o `app` sem subir servidor, e essa separação serve de base para as Aulas 4, 5 e 6.

**Anatomia de um teste:**
- `describe` agrupa os testes.
- `it`/`test` é um caso de teste.
- `expect(x).toBe(y)` é a asserção.

**Tarefa:** testar `hello.js` e `ola.js`, incluindo o caso de string vazia.

---

## Aula 2 — Unidade I: funções puras e utilitárias

**Objetivo:** entender a **função pura**: mesma entrada gera mesma saída, sem efeitos colaterais. É o código mais fácil e barato de testar.

**Pontos-chave:**
- Uma função pura não acessa banco nem rede, não usa `Date.now()` sem controle e não altera estado externo.
- A regra de negócio que estava "grudada" no `UserController.RegisterUser` foi extraída para `src/validators/userValidators.js`, com `senhasConferem`, `idadeValida` e `emailValido`. O controller passou a usar essas funções.
- **Teste parametrizado (`it.each`)**: uma tabela de casos (entrada → esperado) evita copiar o mesmo teste várias vezes.
- **Padrão AAA:**
  1. **Arrange**: preparar os dados.
  2. **Act**: executar a função.
  3. **Assert**: verificar o resultado.

**Tarefa:** extrair `respostaErro(mensagem)` e testá-la.

---

## Aula 3 — Unidade II: Controllers isolados com mocks

**Objetivo:** testar `UserController` e `ProductController` sem MongoDB real, usando **mocks**.

**O que é um mock:** um substituto falso de uma dependência, que permite:
1. controlar o que ela retorna;
2. verificar se foi chamada, com quais argumentos e quantas vezes;
3. evitar efeitos colaterais reais.

**Pontos-chave:**
- Em ESM, os mocks usam `jest.unstable_mockModule(...)` e o módulo é importado **depois**, com `await import(...)`.
- São mockados o model `User`/`Product`, o `bcrypt` e o `jsonwebtoken`.
- `criarResMock()` cria um `res` falso com `status` e `json` retornando o próprio `res`, o que permite o encadeamento `res.status(200).json(...)`.
- `jest.clearAllMocks()` no `beforeEach` isola um teste do outro.
- Cenários do `LoginUser`:
  - **404**: usuário não existe;
  - **401**: senha errada;
  - **200**: retorna o token.
- O middleware `authenticateToken` é testado com um `next = jest.fn()`: sem header ele devolve 401 e não chama `next`; com token válido ele chama `next` e preenche `req.user`.
- **Observação:** o projeto espera o header `authorization` **sem** o prefixo `Bearer`. Os testes documentam o comportamento real do código, mesmo quando ele foge da convenção.

**Tarefa:** testar `createdProduct` e `editProduct`, incluindo o caso "produto não encontrado".

---

## Aula 4 — Integração I: rotas HTTP com banco em memória

**Objetivo:** testar rota → controller → banco de verdade, usando um Mongo descartável.

| | Unidade (Aula 3) | Integração (Aula 4) |
|---|---|---|
| Model | mockado | real, com Mongo em memória |
| Valida | só a lógica do controller | rota + middleware + controller + banco |
| Velocidade | milissegundos | um pouco mais lento |

**Pontos-chave:**
- `src/test-utils/setupTestDb.js` tem três funções: `conectarBancoDeTeste`, `limparBancoDeTeste` e `fecharBancoDeTeste`.
- Ciclo de vida dos testes:
  - `beforeAll`: conecta uma vez;
  - `afterEach`: limpa as coleções, para que os testes sejam independentes;
  - `afterAll`: desliga tudo.
- `request(app).post("/auth/register").send({...})`: testa o registro (200), a senha que não pode voltar em texto puro e as senhas divergentes (400).
- Testa o login com credenciais corretas (token JWT) e com senha errada (401).
- `GET /products/` com o banco vazio retorna `[]`.

**Tarefa:** chamar `POST /products/create-product` sem token e documentar o status real (401 ou 403).

---

## Aula 5 — Integração II: fluxos completos e middlewares

**Objetivo:** testar um fluxo de negócio inteiro e a integração do Socket.io.

**Fluxo completo** (`ProductRouter.test.js`):
1. registrar;
2. logar e pegar o token;
3. criar o produto;
4. editar;
5. deletar;
6. confirmar que o produto sumiu da listagem.

- O helper `criarUsuarioEPegarToken()` reaproveita o passo de autenticação.
- O token vai com `.set("authorization", token)`.
- Criar produto sem token deve dar **401**.
- Esse teste é mais lento porque encadeia várias requisições reais. Em troca, ele valida as "costuras" entre as peças.

**Socket.io (chat):**
- Instale `socket.io-client`, suba um `http` + `socket.io` em uma porta aleatória e conecte dois clientes.
- O cliente A envia `set_username` e `message`, e o cliente B precisa receber `receive_message`.
- Eventos não retornam uma Promise, então o teste usa o callback **`done`** do Jest para sinalizar o fim.

**Tarefa:** cobrir a edição de um produto com `_id` inexistente.

---

## Aula 6 — Testes de Sistema

**Objetivo:** testar o Mynds **rodando de verdade**, como caixa-preta.

| | Integração | Sistema |
|---|---|---|
| Banco | em memória | real (ou o mais próximo possível) |
| Servidor | sobe dentro do Jest | processo separado (Docker ou `npm run dev`) |
| Chamadas | Supertest direto no `app` | HTTP real pela rede (`localhost:4444`) |
| Valida | integração entre módulos | o sistema implantável (envs, portas, Docker) |

**Pontos-chave:**
- **Dockerfile** (`node:20-alpine`): o `COPY package*.json` e o `npm install` vêm **antes** do `COPY . .`. Assim o cache de camadas evita reinstalar as dependências a cada mudança de código.
- O `.dockerignore` exclui `node_modules`, `npm-debug.log` e `.env`.
- O `docker-compose.test.yml` tem dois serviços:
  - `mongo:7`;
  - `backend`, com `dbUrl`, `PORT=4444` e `JWT_SECRET` de teste.
- Os testes ficam em `system-tests/`, **fora** de `src`, e usam `fetch` contra `BASE_URL`:
  - um smoke test em `/products/`;
  - o fluxo registrar → logar → criar produto, com e-mail único via `Date.now()`.
- Para rodar:
  ```bash
  docker compose -f docker-compose.test.yml up -d
  npx jest system-tests
  ```

**Checklist:**
- usar envs de teste, nunca de produção;
- usar um banco isolado;
- deixar as portas livres;
- observar os logs;
- tratar o timeout se o servidor não subir.

**Tarefa:** fazer polling em `/products/` com timeout de 10s e falhar com uma mensagem clara.

---

## Aula 7 — Testes Funcionais de Carga (Performance)

**Objetivo:** perceber que "funcionar" e "funcionar sob uso real" são coisas diferentes, e medir a segunda com **k6**.

**Vocabulário:**

| Termo | Significado |
|---|---|
| Carga | quantidade esperada de usuários |
| Estresse | carga além do esperado, para achar o ponto de ruptura |
| Pico (spike) | explosão repentina de acessos |
| Resistência (soak) | carga moderada por horas, para achar vazamento de memória |
| VU | usuário virtual que repete a função `default` |
| `stages` | degraus de carga ao longo do tempo |
| `sleep` (think time) | pausa que imita um usuário real |
| p95 / p99 | tempo abaixo do qual ficam 95% ou 99% das respostas (melhor que a média) |
| RPS | requisições por segundo. Um servidor lento **reduz** o RPS |

**`check` × `threshold`:**
- `check` avalia **uma** resposta. Se falhar, só entra na estatística e o teste continua.
- `threshold` é uma meta sobre o **conjunto** das respostas. Se falhar, o k6 sai com exit code ≠ 0 e o teste reprova.
- Por isso todos os scripts usam `checks: ["rate>0.99"]`.

**Ambiente:**
- Instale o k6 (`winget install k6`) ou rode via Docker (`grafana/k6`), usando `host.docker.internal`.
- 🚨 **Nunca rode carga contra produção ou contra o banco compartilhado.** Use o Compose da Aula 6 (porta 4444, Mongo descartável).
- Os scripts ficam em `load-tests/` e **não** podem terminar em `.test.js`. Senão o Jest tenta executá-los e quebra.

**Scripts:**
- **`listar-produtos.js`**:
  - o `setup()` roda uma vez e popula o banco com N produtos;
  - os `stages` sobem, mantêm e descem a carga;
  - thresholds: `p(95)<300`, `http_req_failed<1%`, `checks>99%`;
  - os parâmetros vêm de `-e VUS=50 -e PRODUTOS=1000`;
  - o check tem `try/catch` porque, sob carga, a resposta pode não ser JSON.
- **`fluxo-login.js`**:
  - o `setup()` cria o usuário e retorna `data` para os VUs;
  - cada iteração faz login e depois cria um produto;
  - os nomes dos produtos são únicos via `__VU`/`__ITER`;
  - há thresholds **por rota**, via tags: login `p(95)<800`, porque o `bcrypt` é propositalmente lento, e criar-produto `p(95)<300`;
  - o check exige **exatamente 200**, porque um check permissivo não testa nada.

**Perfis de carga:** basta trocar os `stages` para ter estresse (degraus até 200 VUs), pico (5 → 150 → 5) ou resistência (2h a 20 VUs, acompanhando com `docker stats`).

**Leitura do resultado:**
- ✓/✗ indica se cada threshold passou.
- Olhe `p(95)`/`p(99)` e o `max`, não só o `avg`.
- `http_reqs` > `iterations` porque o `setup()` também conta.
- Um `http_req_failed` alto costuma indicar esgotamento de conexões.
- O pool padrão do Mongo é `maxPoolSize: 100`. Experimento: usar `maxPoolSize: 5` e comparar.
- Para exportar o resultado: `--summary-export=resultado.json`.

**Tarefa:** comparar 5 × 50 VUs (`p(95)`, taxa de falhas e RPS). Bônus: usar `PRODUTOS=2000` e explicar por que uma rota sem paginação fica lenta.

---

# Prova — Aulas 1 a 7

**Valor total: 10 pontos**

| Parte | Questões | Valor |
|---|---|---|
| A — Múltipla escolha | 18 × 0,25 | 4,5 |
| B — Verdadeiro ou Falso | 6 × 0,25 | 1,5 |
| C — Discursivas | 4 × 0,5 | 2,0 |
| D — Práticas | 2 × 1,0 | 2,0 |

O gabarito está no final. Tente responder antes de consultar.

## Parte A — Múltipla escolha

**1.** Por que o projeto separa `app.js` de `server.js`?

- a) Para melhorar a performance do Express em produção.
- b) Para que o Supertest use o `app` sem precisar abrir uma porta real.
- c) Porque o ES Modules não permite `app.listen` no mesmo arquivo das rotas.
- d) Porque o Docker exige dois arquivos de entrada.

**2.** Por que o script de teste usa `node --experimental-vm-modules`?

- a) Para rodar os testes em paralelo.
- b) Para habilitar o coverage.
- c) Porque o Backend usa `import/export` (ESM) e o Jest, por padrão, entende CommonJS.
- d) Para carregar o `.env` automaticamente.

**3.** Qual das funções abaixo é uma **função pura**?

- a) Uma função que retorna `Date.now() + 1000`.
- b) `soma(a, b)`, que retorna `a + b`.
- c) Uma função que busca um usuário com `User.findOne`.
- d) Uma função que incrementa uma variável global `contador`.

**4.** Para que serve o `it.each` no Jest?

- a) Rodar o mesmo teste várias vezes para medir performance.
- b) Escrever um teste parametrizado, com uma tabela de entradas e saídas esperadas.
- c) Rodar um teste para cada arquivo do projeto.
- d) Repetir um teste até ele passar.

**5.** A ordem correta das fases do padrão AAA é:

- a) Assert → Act → Arrange
- b) Act → Arrange → Assert
- c) Arrange → Act → Assert
- d) Arrange → Assert → Act

**6.** Em um projeto ESM, como se mocka um módulo com Jest?

- a) Com `jest.mock("modulo")` no topo e `import` estático normal.
- b) Com `jest.unstable_mockModule(...)` e importando o módulo **depois**, com `await import(...)`.
- c) Com `jest.spyOn(require("modulo"))`.
- d) Não é possível mockar módulos em ESM.

**7.** No `criarResMock()`, por que `res.status` retorna o próprio `res`?

- a) Para economizar memória.
- b) Para permitir o encadeamento `res.status(200).json(...)`, como no código real.
- c) Porque o Jest exige que todo mock retorne um objeto.
- d) Para que o teste falhe caso `json` não seja chamado.

**8.** No teste de **integração** da Aula 4, o model do Mongoose é:

- a) Mockado com `jest.fn()`.
- b) Real, conectado ao MongoDB de produção.
- c) Real, conectado a um MongoDB em memória (`mongodb-memory-server`).
- d) Substituído por um arquivo JSON.

**9.** Qual é o objetivo de chamar `limparBancoDeTeste()` no `afterEach`?

- a) Deixar os testes mais rápidos.
- b) Garantir que os testes sejam independentes, sem dados "vazando" de um para outro.
- c) Fechar a conexão com o banco.
- d) Gerar o relatório de coverage.

**10.** Por que o teste do Socket.io usa o callback `done`?

- a) Porque eventos de socket não retornam uma Promise, e o teste só deve terminar quando o evento chegar.
- b) Porque o Jest não suporta `async/await`.
- c) Para desligar o servidor de socket.
- d) Para rodar o teste em outra porta.

**11.** No Dockerfile, por que `COPY package*.json ./` e `RUN npm install` vêm **antes** de `COPY . .`?

- a) Porque o Docker exige essa ordem.
- b) Para aproveitar o cache de camadas: se o `package.json` não mudar, o `npm install` não roda de novo.
- c) Para não copiar o `.env`.
- d) Para a imagem rodar como root.

**12.** Por que os testes de sistema ficam em `system-tests/`, fora de `src/`?

- a) Porque o Jest não encontra arquivos fora de `src/`.
- b) Porque rodam contra um servidor já de pé (Docker), não junto com a suíte de unidade e integração.
- c) Porque são escritos em outra linguagem.
- d) Por causa do `.dockerignore`.

**13.** O que acontece no k6 quando um **threshold** falha?

- a) Nada: só aparece no resumo.
- b) O k6 para imediatamente a execução.
- c) O k6 termina com exit code diferente de 0 (o teste reprova).
- d) O k6 repete o teste automaticamente.

**14.** Em `fluxo-login.js`, por que o login tem meta `p(95)<800` e criar produto tem `p(95)<300`?

- a) Porque o login envia mais dados.
- b) Porque o `bcrypt.compare` é propositalmente lento e pesado para a CPU.
- c) Porque o login não usa o banco.
- d) Porque o k6 exige metas diferentes por rota.

**15.** Por que os scripts de `load-tests/` **não podem** terminar em `.test.js`?

- a) Porque o k6 só aceita a extensão `.k6`.
- b) Porque o Jest tentaria executá-los e quebraria no `import http from "k6/http"`.
- c) Porque o Docker ignora esses arquivos.
- d) Porque o Git ignora arquivos `.test.js`.

**16.** Qual perfil de carga é mais indicado para encontrar **vazamentos de memória**?

- a) Estresse
- b) Pico (spike)
- c) Resistência (soak)
- d) Smoke

**17.** Por que olhar `p(95)` é melhor do que olhar só a média (`avg`)?

- a) Porque a média é mais difícil de calcular.
- b) Porque a média pode esconder os piores casos, como usuários que esperaram muito.
- c) Porque o `p(95)` é sempre menor que a média.
- d) Porque o k6 não mostra a média.

**18.** No resumo do k6, por que `http_reqs` pode ser maior que `iterations`?

- a) Por causa de requisições duplicadas por erro.
- b) Porque as requisições feitas no `setup()` também entram na conta.
- c) Porque cada VU conta duas vezes.
- d) Porque o `sleep` gera requisições extras.

## Parte B — Verdadeiro ou Falso

**19.** ( ) O teste de carga pode rodar contra produção, desde que seja de madrugada.

**20.** ( ) O `mongodb-memory-server` garante que os testes de integração não toquem no banco real.

**21.** ( ) Quando um `check` falha no k6, o processo termina com exit code diferente de 0.

**22.** ( ) O `authenticateToken` do projeto espera o header no formato `Bearer <token>`.

**23.** ( ) Carga/Performance e Coverage ficam na base da pirâmide de testes.

**24.** ( ) Com número fixo de VUs e `sleep(1)`, um servidor mais lento faz o RPS cair.

## Parte C — Discursivas

**25.** Cite e explique **três** diferenças entre um teste de integração (Aulas 4 e 5) e um teste de sistema (Aula 6).

**26.** Um colega escreveu o check abaixo. Explique por que ele é um problema.

```js
check(res, { "ok": (r) => r.status === 200 || r.status === 401 || r.status === 404 });
```

**27.** Explique a pirâmide de testes e por que a base (unidade) deve ter mais testes que o topo.

**28.** Um script k6 tem 20 VUs. Cada iteração faz 1 requisição e depois `sleep(1)`. Se o servidor demorar 500 ms para responder, qual é o RPS aproximado? Mostre a conta.

## Parte D — Práticas

**29.** Escreva um teste de unidade para `idadeValida(age)` usando `it.each`. A função aceita inteiros de 0 a 130. Cubra os limites (0 e 130), valores fora do intervalo e um número não inteiro.

**30.** Escreva um teste de integração com Supertest e banco em memória que:

1. registre um usuário e faça login;
2. crie um produto autenticado;
3. verifique que `GET /products/` retorna esse produto na lista.

Use as funções de `setupTestDb.js`.

---

## Gabarito

<details>
<summary>Clique para ver as respostas</summary>

### Parte A

| Questão | Resposta | Questão | Resposta |
|---|---|---|---|
| 1 | b | 10 | a |
| 2 | c | 11 | b |
| 3 | b | 12 | b |
| 4 | b | 13 | c |
| 5 | c | 14 | b |
| 6 | b | 15 | b |
| 7 | b | 16 | c |
| 8 | c | 17 | b |
| 9 | b | 18 | b |

### Parte B

- **19. F.** Carga nunca roda contra produção ou contra o banco compartilhado: na prática, é atacar o próprio sistema.
- **20. V.**
- **21. F.** Um check que falha só entra na estatística. Quem reprova o teste é o threshold, como `checks: ["rate>0.99"]`.
- **22. F.** O projeto passa o header inteiro para o `jwt.verify`, **sem** o prefixo `Bearer`.
- **23. F.** São eixos transversais, fora da pirâmide clássica.
- **24. V.**

### Parte C

**25.** Qualquer três das diferenças abaixo:

- **Banco:** a integração usa um banco em memória e descartável; o sistema usa um banco real ou o mais próximo possível do real.
- **Servidor:** na integração, o próprio Jest monta o `app` dentro do processo de teste; no sistema, o servidor é um processo separado (Docker ou `npm run dev`).
- **Chamadas:** a integração usa o Supertest direto no objeto `app`; o sistema faz requisições HTTP reais pela rede (`localhost:4444`).
- **O que valida:** a integração valida a conversa entre os módulos do código; o sistema valida o sistema implantável como um todo (envs, portas, Docker).

**26.** O check aceita 401 e 404 como sucesso, então passaria mesmo se o usuário não existisse ou a autenticação falhasse. Um teste que sempre passa não testa nada. O check deve exigir exatamente o status esperado (200).

**27.** A pirâmide tem três níveis:

- **base:** unidade (muitos testes, rápidos e baratos);
- **meio:** integração;
- **topo:** sistema, E2E e aceitação (poucos testes, lentos e caros).

A base deve ser maior porque os testes de unidade rodam em milissegundos, são baratos de manter e apontam exatamente onde está o erro. Os testes do topo dão mais confiança, mas são lentos e frágeis, então ficam reservados aos fluxos principais.

**28.** Cada iteração leva 0,5 s (resposta) + 1 s (sleep) = 1,5 s, então cada VU faz 1 / 1,5 ≈ 0,67 req/s. Com 20 VUs, são 20 × 0,67 ≈ **13 RPS**. Com resposta instantânea, seriam cerca de 20 RPS.

### Parte D

**29.** Resposta esperada:

```js
import { idadeValida } from "./userValidators.js";

describe("idadeValida()", () => {
  it.each([
    [0, true],
    [18, true],
    [130, true],
    [-1, false],
    [131, false],
    [17.5, false],
  ])("idadeValida(%p) deve retornar %p", (idade, esperado) => {
    expect(idadeValida(idade)).toBe(esperado);
  });
});
```

**30.** Resposta esperada:

```js
import request from "supertest";
import { app } from "../app.js";
import { conectarBancoDeTeste, limparBancoDeTeste, fecharBancoDeTeste } from "../test-utils/setupTestDb.js";

beforeAll(async () => await conectarBancoDeTeste());
afterEach(async () => await limparBancoDeTeste());
afterAll(async () => await fecharBancoDeTeste());

it("lista o produto recém-criado", async () => {
  // Arrange: cria usuário e pega o token
  await request(app).post("/auth/register").send({
    name: "Aluno", age: 20, email: "prova@mynds.com",
    password: "123456", confirmPassword: "123456",
  });
  const login = await request(app).post("/auth/login")
    .send({ email: "prova@mynds.com", password: "123456" });
  const token = login.body.token;

  // Act: cria o produto e lista
  const criar = await request(app)
    .post("/products/create-product")
    .set("authorization", token) // sem "Bearer"
    .send({ name: "Caneca", mark: "Mynds", color: "Preta", description: "Café", price: 30, type: "outros" });
  const listar = await request(app).get("/products/");

  // Assert
  expect(criar.status).toBe(200);
  expect(listar.status).toBe(200);
  const nomes = listar.body.products.map((p) => p.name);
  expect(nomes).toContain("Caneca");
});
```

</details>
