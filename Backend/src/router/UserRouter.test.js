import request from 'supertest';
import {app} from '../app'; // Adjust the import path based on your project structure
import { conectarBancoDeTeste, desconectarBancoDeTeste, limparBancoDeTeste } from '../test-utils/setupTestDB';

beforeAll(async () => { await conectarBancoDeTeste(); });
afterAll(async () => { await limparBancoDeTeste(); });
afterAll(async () => { await desconectarBancoDeTeste(); });

describe('Post /auth/register', () => {
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

    // describe("Post /auth/login", () => {
    //     beforeEach(async () => {
    //         await request(app)
    //             .post('/auth/register')
    //             .send({
    //                 name: "Teste",
    //                 age: 25,
    //                 email: "teste@example.com",
    //                 password: "senha123",
    //                 confirmPassword: "senha123"
    //             });
    //     });

    //     it("Faz login com sucesso", async () => {
    //         const resposta = await request(app)
    //             .post('/auth/login')
    //             .send({
    //                 email: "teste@example.com",
    //                 password: "senha123"
    //             });

    //         expect(resposta.status).toBe(200);
    //         expect(typeof resposta.body.token).toBe("string");
    //     });
    // });
})