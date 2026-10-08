//Escrever o teste de integração de POST /products/create-product sem enviar token e verificar 
//que a API responde com o status de erro correto (dica: hoje o authenticateToken chama res.status(403)
//quando o jwt.verify falha — investigue e documente o comportamento real).

import request from 'supertest';
import { app } from '../app.js';
import { conectarBancoDeTeste, fecharBancoDeTeste, limparBancoDeTeste } from '../test-utils/setupTestDb.js';

beforeAll(async () => { await conectarBancoDeTeste(); });
afterEach(async () => { await limparBancoDeTeste(); });
afterAll(async () => { await fecharBancoDeTeste(); });

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

describe("POST /products/create-product sem token", () => {
    it("Deve retornar 403 Forbidden quando não há token", async () => {
        const token = ""
        const criar = await request(app)
            .post("/products/create-product")
            .set("authorization", token)
            .send({ name: "Camiseta", mark: "Mynds", color: "Azul", description: "Básica", price: 59.9, type: "masculino" });
        expect(criar.status).toBe(403);
        expect(criar.body.message).toBe("Token Inválido");
    });
})