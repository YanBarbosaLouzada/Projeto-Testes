import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

describe("Modal", () => {
    it("fecha ao clicar no botão de fechar", async () => {
        const fecharOModal = vi.fn();
        const user = userEvent.setup();
        const { container } = render(<Modal fecharOModal={fecharOModal} createProduct={() => {}} />);

        await user.click(container.querySelector(".closeModal"));
        expect(fecharOModal).toHaveBeenCalled();
        expect(screen.getByText("Adicionar Produto")).toBeInTheDocument();
    });
});
