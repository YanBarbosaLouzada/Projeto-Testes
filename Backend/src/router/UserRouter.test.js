import request from 'supertest';
import {app} from '../app.js';
import { conectarBancoDeTeste, fecharBancoDeTeste, limparBancoDeTeste } from '../test-utils/setupTestDb.js';

beforeAll(async () => { await conectarBancoDeTeste(); });
afterEach(async () => { await limparBancoDeTeste(); });
afterAll(async () => { await fecharBancoDeTeste(); });

// middleware para lidar com erros

describe("Post /auth/register", () => {
    it("Cria um novo usuário com sucesso", async () => {
        const resposta = await request(app)
            .post("/auth/register")
            .send({
                name: "Aluno Teste",
                age: 20,
                email: "aluno@mynds.com",
                password: "SenhaForte1234",
                confirmPassword: "SenhaForte1234"
            });

        expect(resposta.status).toBe(200);
        expect(resposta.body.message).toBe("Usuário criado com sucesso!");
        expect(resposta.body.data.email).toBe("aluno@mynds.com");

        expect(resposta.body.data.password).toBeUndefined();
    })

    it("rejeita senhas fracas e emails duplicados", async () => {
        const fraco = await request(app).post("/auth/register").send({
            name: "Aluno",
            age: 20,
            email: "fraco@mynds.com",
            password: "123456",
            confirmPassword: "123456"
        });
        expect(fraco.status).toBe(400);

        const email = "duplicado@mynds.com";
        const cadastro = {
            name: "Aluno",
            age: 20,
            email,
            password: "SenhaForte1234",
            confirmPassword: "SenhaForte1234"
        };
        await request(app).post("/auth/register").send(cadastro);
        const duplicado = await request(app).post("/auth/register").send(cadastro);
        expect(duplicado.status).toBe(409);
    });

    describe("Post /auth/login", () => {
        beforeEach(async () => {
            await request(app)
                .post("/auth/register")
                .send({
                    name: "Aluno Teste",
                    age: 20,
                    email: "login@mynds.com",
                    password: "SenhaForte1234",
                    confirmPassword: "SenhaForte1234"
                });
        });

        it("Faz login com sucesso e devolve token", async () => {
            const resposta = await request(app)
                .post("/auth/login")
                .send({
                    email: "login@mynds.com",
                    password: "SenhaForte1234"
                });

            expect(resposta.status).toBe(200);
            expect(typeof resposta.body.token).toBe("string");
        });
    });
})