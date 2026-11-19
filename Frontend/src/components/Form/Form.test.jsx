import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Form from "./Form";

describe("Form", () => {
    it("envia os dados de criação do produto", async () => {
        const createProduct = vi.fn();
        const fecharOModal = vi.fn();
        const user = userEvent.setup();
        render(<Form createProduct={createProduct} fecharOModal={fecharOModal} />);

        await user.type(screen.getByLabelText("Nome"), "Camiseta");
        await user.type(screen.getByLabelText("Marca"), "Mynds");
        await user.type(screen.getByLabelText("Cor"), "Azul");
        await user.type(screen.getByLabelText("Descrição"), "Básica");
        await user.type(screen.getByLabelText("Preço"), "59.90");
        await user.selectOptions(screen.getByLabelText("Tipo"), "masculino");
        await user.click(screen.getByRole("button", { name: /criar produto/i }));

        expect(createProduct).toHaveBeenCalled();
        expect(fecharOModal).toHaveBeenCalled();
    });

    it("mostra dados existentes no modo edição", () => {
        render(<Form
            editingProduct={{ _id: "1", name: "Produto", releaseDate: "2026-01-01", imageUrl: "imagem.png" }}
            createProduct={() => {}}
            fecharOModal={() => {}}
        />);
        expect(screen.getByText("Editar Produto")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Produto")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /editar produto/i })).toBeInTheDocument();
    });
});
