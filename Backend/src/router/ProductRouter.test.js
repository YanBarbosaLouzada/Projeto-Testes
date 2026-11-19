import request from 'supertest';
import { app } from '../app.js';
import { conectarBancoDeTeste, fecharBancoDeTeste, limparBancoDeTeste } from '../test-utils/setupTestDb.js';

beforeAll(async () => { await conectarBancoDeTeste(); });
afterEach(async () => { await limparBancoDeTeste(); });
afterAll(async () => { await fecharBancoDeTeste(); });

describe("POST /products/create-product sem token", () => {
    it("retorna 401 quando não há token Bearer", async () => {
        const criar = await request(app)
            .post("/products/create-product")
            .send({})
        expect(criar.status).toBe(401);
        expect(criar.body.message).toBe("Autenticação Bearer obrigatória.");
    });

    it("returns a paginated empty catalogue", async () => {
        const response = await request(app).get("/products/?page=1&limit=10");
        expect(response.status).toBe(200);
        expect(response.body.products).toEqual([]);
        expect(response.body.pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
    });

    it("rejects invalid pagination and category filters", async () => {
        const invalidPage = await request(app).get("/products/?page=-1");
        const invalidCategory = await request(app).get("/products/?type=admin");
        expect(invalidPage.status).toBe(400);
        expect(invalidCategory.status).toBe(400);
    });
})