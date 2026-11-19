import { http, HttpResponse } from "msw";

const produtosFake = [
    { _id: "1", name: "Camiseta Azul", mark: "Mynds", color: "Azul", description: "Básica", price: 59.9, type: "masculino", releaseDate: "2026-05-14T00:00:00.000Z" },
    { _id: "2", name: "Vestido Floral", mark: "Mynds", color: "Rosa", description: "Verão", price: 129.9, type: "feminino", releaseDate: "2026-05-10T00:00:00.000Z" },
];

export const handlers = [
    http.get("*/products/", ({ request }) => {
        const url = new URL(request.url);
        const type = url.searchParams.get("type");
        const page = Number(url.searchParams.get("page") || 1);
        const filteredProducts = type
            ? produtosFake.filter((product) => product.type === type)
            : produtosFake;
        return HttpResponse.json({
            products: page === 1 ? filteredProducts : [],
            pagination: { page, limit: 20, total: filteredProducts.length, totalPages: 1 }
        })
    }),

    http.post("*/products/create-product", async ({ request }) => {
        const novoProduto = await request.json()
        return HttpResponse.json({
            message: "Produto criado com sucesso!",
            data: { _id: "3", ...novoProduto }
        })
    }),

    http.put("*/products/edit-product", async ({ request }) => {
        const product = await request.json();
        return HttpResponse.json({
            message: "Editado com sucesso!",
            updatedProduct: product
        });
    }),

    http.post("*/auth/register", async ({ request }) => {
        const novoUsuario = await request.json();
        return HttpResponse.json({
            message: "Usuario criado com sucesso!",
            data: { _id: "1", ...novoUsuario }
        }, { status: 200 });
    }),

    http.post("*/auth/login", async () => {
        return HttpResponse.json({ token: "token-de-teste" }, { status: 200 });
    }),

    http.delete("*/products/delete-product/:id", () => {
        return HttpResponse.json({ message: "Deletado com sucesso!" })
    })
]