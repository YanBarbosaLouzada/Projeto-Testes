import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event";
import Product from "./Product"

const produtoFake = {
    _id: "1",
    name: "Camiseta Azul",
    mark: "OKALEI",
    color: "Azul",
    description: "Camiseta 100% algodão",
    price: 59.9,
    type: "masculino",
    releaseDate: "2026-05-14T00:00:00.000Z"
};

describe("Produto", () => {
    it("exibe nome,marca,cor,preço formatado e categoria", () => {
        render(<Product {...produtoFake} setEditMode={() => { }} deleteProduct={() => { }} />)

        expect(screen.getByText("Camiseta Azul")).toBeInTheDocument();
        expect(screen.getByText("Camiseta 100% algodão")).toBeInTheDocument();
        expect(screen.getByText("R$ 59.90")).toBeInTheDocument();
        expect(screen.getByText("Masculino")).toBeInTheDocument();
    })
    it("Função de deletar produto com o id correto", async () => {
        const aoDeletar = vi.fn();
        const user = userEvent.setup();
        render(<Product {...produtoFake} setEditMode={() => { }} deleteProduct={aoDeletar} />)

        await user.click(screen.getByRole("button", { name: /excluir produto/i }))

        expect(aoDeletar).toHaveBeenCalled("1")
    })
})