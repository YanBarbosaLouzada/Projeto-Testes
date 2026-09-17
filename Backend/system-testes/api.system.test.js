const BASE_URL = process.env.SYSTEM_BASE_URL || "http://localhost:4444";

async function chamarApi(caminho, opcoes = {}) {
    const resposta = await fetch(`${BASE_URL}${caminho}`, {
        ...opcoes,
        headers: { "Content-Type": "application/json", ...opcoes.headers },
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
