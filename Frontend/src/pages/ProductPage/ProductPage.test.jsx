import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { server } from "../../test/server";
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

    it("filtra produtos e permite carregar a próxima página", async () => {
        const user = userEvent.setup();
        server.use(http.get("*/products/", ({ request }) => {
            const url = new URL(request.url);
            const page = Number(url.searchParams.get("page"));
            const type = url.searchParams.get("type");
            if (type) {
                return HttpResponse.json({
                    products: page === 1 ? [{
                        _id: "3",
                        name: "Calça Masculina",
                        mark: "Mynds",
                        color: "Preta",
                        price: 99,
                        type: "masculino"
                    }] : [],
                    pagination: { page, limit: 20, total: 1, totalPages: 1 }
                });
            }
            return HttpResponse.json({
                products: page === 1 ? [{
                    _id: "1",
                    name: "Camiseta Azul",
                    mark: "Mynds",
                    color: "Azul",
                    price: 59,
                    type: "masculino"
                }] : [{
                    _id: "2",
                    name: "Vestido Floral",
                    mark: "Mynds",
                    color: "Rosa",
                    price: 129,
                    type: "feminino"
                }],
                pagination: { page, limit: 1, total: 2, totalPages: 2 }
            });
        }));
        renderComRouter(<ProductPage />);

        expect(await screen.findByText("Camiseta Azul")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /carregar mais/i }));
        expect(await screen.findByText("Vestido Floral")).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: /Masculino/ }));
        expect(await screen.findByText("Calça Masculina")).toBeInTheDocument();
    });

    it("mostra o erro retornado pela API", async () => {
        server.use(http.get("*/products/", () => HttpResponse.json(
            { message: "Serviço temporariamente indisponível." },
            { status: 503 }
        )));
        renderComRouter(<ProductPage />);
        expect(await screen.findByRole("alert")).toHaveTextContent("Serviço temporariamente indisponível.");
    });
});