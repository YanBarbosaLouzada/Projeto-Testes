# Prova — Testes de Software (Aulas 1 a 8)

**Nome:** ______________________________________ **Data:** ___/___/______

**Valor:** 10 pontos (1 ponto por questão)

**Instruções:**
- Leia cada questão com calma antes de responder.
- Nas questões de múltipla escolha, marque **só uma** alternativa.
- Nas questões abertas, responda com suas palavras. Não precisa ser longo, precisa ser claro.

---

## Parte 1 — Múltipla escolha

**1. (Aula 1)** Olhe o teste abaixo:

```js
describe("soma()", () => {
  it("deve somar dois números positivos", () => {
    expect(soma(2, 3)).toBe(5);
  });
});
```

Qual parte do código **confere se o resultado está certo**?

- a) `describe("soma()", ...)`
- b) `it("deve somar dois números positivos", ...)`
- c) `expect(soma(2, 3)).toBe(5)`
- d) `() => { ... }`

---

**2. (Aula 2)** Uma **função pura** sempre devolve o mesmo resultado para a mesma entrada e não mexe em nada fora dela. Qual destas funções é pura?

- a) `function dobro(n) { return n * 2; }`
- b) `function agora() { return Date.now(); }`
- c) `function buscarUsuario(email) { return User.findOne({ email }); }`
- d) `function contar() { contador = contador + 1; }`

---

**3. (Aula 3)** Imagine que você quer testar se o **controle remoto** funciona, mas não quer ligar a TV de verdade. Então você usa uma "TV de mentira" que só registra quais botões foram apertados. Nos testes, essa "TV de mentira" se chama:

- a) Threshold
- b) Mock
- c) Smoke test
- d) Stage

---

**4. (Aula 4)** Nos testes de integração, usamos o `mongodb-memory-server`. Por quê?

- a) Porque ele deixa o Jest mais rápido do que qualquer outro banco.
- b) Porque ele substitui o Express e responde às rotas no lugar dele.
- c) Porque ele mede quantos usuários o sistema aguenta ao mesmo tempo.
- d) Porque ele cria um banco temporário, sem tocar no banco real.

---

**5. (Aula 7)** Na ferramenta k6, o que é um **VU**?

- a) Um programa que procura vírus e falhas de segurança no sistema.
- b) Um banco de dados falso que o k6 cria só durante o teste.
- c) Um usuário de mentira que repete as ações do script sem parar.
- d) Uma versão especial do Node.js feita para rodar testes de carga.

---

## Parte 2 — Verdadeiro ou Falso

**6. (Aulas 1 a 7)** Escreva **V** (verdadeiro) ou **F** (falso). Cada item vale 0,25.

- a) ( ) Na pirâmide de testes, os testes de **unidade** ficam na base porque são muitos, rápidos e baratos.
- b) ( ) No padrão AAA, a ordem é: **Act** (executar), **Arrange** (preparar), **Assert** (verificar).
- c) ( ) Teste de carga pode ser feito no sistema de produção, com os usuários reais usando ao mesmo tempo.
- d) ( ) No teste do chat com Socket.io, usamos o `done` porque a mensagem chega "quando der", e o teste precisa esperar ela chegar para terminar.

---

## Parte 3 — Questões abertas

**7. (Aula 5)** O teste de "fluxo completo" da Aula 5 segue esta ordem:

> registrar → logar → criar produto → editar → deletar → conferir a lista

Por que **não dá** para criar o produto antes de fazer o login? O que o login entrega que é usado no passo seguinte?

_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________

---

**8. (Aula 6)** Complete a tabela com as diferenças entre um teste de **integração** e um teste de **sistema**:

| | Integração | Sistema |
|---|---|---|
| Onde fica o banco de dados? | | |
| O servidor roda onde? | | |

---

**9. (Aula 8)** Um colega escreveu este teste para a função `idadeValida`:

```js
it("testa a idade", () => {
  idadeValida(20);
  idadeValida(-5);
  idadeValida(200);
});
```

Ao rodar `npm run test:coverage`, o relatório mostrou **100% de cobertura** para essa função. Ele disse: "Pronto, a função está 100% testada!".

Ele está certo? Explique o que o coverage mede e o que está faltando nesse teste.

_____________________________________________________________________________

_____________________________________________________________________________

_____________________________________________________________________________

---

## Parte 4 — Prática

**10. (Aula 7)** Complete o `options` do script k6 abaixo para que ele faça o seguinte:

- **Stages (degraus de carga):**
  1. subir de 0 até **20 VUs** em **30 segundos**;
  2. manter **20 VUs** durante **1 minuto**;
  3. descer até **0 VUs** em **10 segundos**.
- **Thresholds (metas):**
  1. 95% das respostas devem chegar em **menos de 300 ms**;
  2. menos de **1%** das requisições podem falhar.

```js
export const options = {
  stages: [
    { duration: "______", target: ______ },
    { duration: "______", target: ______ },
    { duration: "______", target: ______ },
  ],
  thresholds: {
    http_req_duration: ["____________"],
    http_req_failed: ["____________"],
  },
};
```

---
---

# Gabarito (para o professor)

### Parte 1 — Múltipla escolha

| Questão | Resposta | Por quê |
|---|---|---|
| 1 | **c** | O `expect(...).toBe(...)` é a asserção: compara o resultado com o esperado. O `describe` só agrupa e o `it` só dá nome ao caso. |
| 2 | **a** | `dobro` não depende de nada externo. A (b) muda a cada momento, a (c) acessa o banco e a (d) altera uma variável de fora. |
| 3 | **b** | O mock é um substituto falso de uma dependência real (como o model `User` ou o `bcrypt`). |
| 4 | **d** | O banco em memória é descartável e isolado, então o teste nunca suja o banco real. |
| 5 | **c** | VU = *Virtual User*. Cada um repete a função `default` do script. |

### Parte 2 — Verdadeiro ou Falso (0,25 cada item)

- **a) V.**
- **b) F.** A ordem certa é Arrange → Act → Assert (preparar → executar → verificar).
- **c) F.** Nunca se roda carga contra produção ou contra o banco compartilhado. Seria como "atacar" o próprio sistema e prejudicar os usuários reais.
- **d) V.** Eventos de socket não devolvem uma Promise, então o teste chama `done()` quando a mensagem chega.

### Parte 3 — Questões abertas

**7.** A rota de criar produto é protegida: só aceita quem está autenticado. O login devolve um **token** (JWT), que é enviado no cabeçalho `authorization` da requisição de criar produto. Sem o token, a API responde **401** (não autorizado).

- 1 ponto: cita o token **e** que a rota exige autenticação.
- 0,5 ponto: cita só um dos dois.

**8.**

| | Integração | Sistema |
|---|---|---|
| Onde fica o banco de dados? | Em memória, temporário (`mongodb-memory-server`) | Banco real, ou o mais parecido possível (Mongo no Docker) |
| O servidor roda onde? | Dentro do próprio Jest (Supertest chama o `app` direto) | Em um processo separado (Docker ou `npm run dev`), acessado pela rede (`localhost:4444`) |

- 0,5 ponto por linha correta.

**9.** Não, ele não está certo. O coverage mede só **quais linhas do código rodaram** durante os testes, não se o resultado foi conferido. O teste chama a função, mas não tem nenhum `expect`, então ele passaria mesmo se `idadeValida` devolvesse a resposta errada. Falta verificar o resultado, por exemplo `expect(idadeValida(20)).toBe(true)` e `expect(idadeValida(-5)).toBe(false)`. Coverage mede risco, não qualidade.

- 1 ponto: diz que ele está errado, explica que coverage só mede o que rodou **e** aponta a falta de `expect`.
- 0,5 ponto: aponta só um dos dois (o que o coverage mede **ou** a falta de `expect`).

### Parte 4 — Prática

**10.** Resposta esperada:

```js
export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 20 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
  },
};
```

Critérios:
- 0,5 ponto: os três stages corretos (0,5 se todos certos, 0,25 se acertar dois).
- 0,5 ponto: os dois thresholds corretos (0,25 cada). Aceite `"1min"` no lugar de `"1m"`.
