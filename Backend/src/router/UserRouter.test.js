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
                password: "123456",
                confirmPassword: "123456"
            });

        expect(resposta.status).toBe(200);
        expect(resposta.body.message).toBe("Usuario criado com sucesso!");
        expect(resposta.body.data.email).toBe("aluno@mynds.com");

        expect(resposta.body.data.password).not.toBe("123456"); // A senha deve ser criptografada e não deve ser igual à senha original
    })

    describe("Post /auth/login", () => {
        beforeEach(async () => {
            await request(app)
                .post("/auth/register")
                .send({
                    name: "Aluno Teste",
                    age: 20,
                    email: "login@mynds.com",
                    password: "123456",
                    confirmPassword: "123456"
                });
        });

        it("Faz login com sucesso e devolve token", async () => {
            const resposta = await request(app)
                .post("/auth/login")
                .send({
                    email: "login@mynds.com",
                    password: "123456"
                });

            expect(resposta.status).toBe(200);
            expect(typeof resposta.body.token).toBe("string");
        });
    });
})