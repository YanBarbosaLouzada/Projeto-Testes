import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddNewButton from "./AddNewButton";

describe("AddNewButton", () => {
    it("Mostrar apenas o + antes do hover", () => {
        render(<AddNewButton abrirOModal={()=>{}}></AddNewButton>)
        expect(screen.getByText("+")).toBeInTheDocument()
    })

    it("Mostrar texto completo ao passar o mouse por cima", async () => {
        const user = userEvent.setup();
        render(<AddNewButton abrirOModal={()=>{}}></AddNewButton>)
        await user.hover(screen.getByText("+"));
        expect(screen.getByText("Adicionar um produto")).toBeInTheDocument()
    })

    it("Chama o abrirOModal ao clicar", async () => {
        const funcaoFalsaDeAbrirModal = vi.fn();
        const user = userEvent.setup();
        render(<AddNewButton abrirOModal={funcaoFalsaDeAbrirModal}></AddNewButton>)

        await user.click(screen.getByText("+"));

        expect(funcaoFalsaDeAbrirModal).toHaveBeenCalledTimes(1)
    })

})