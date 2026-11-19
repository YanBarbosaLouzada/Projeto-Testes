import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Join from "./Join";

const socket = {
    emit: vi.fn()
};

vi.mock("socket.io-client", () => ({
    io: vi.fn(() => socket)
}));

describe("Join", () => {
    beforeEach(() => {
        socket.emit.mockClear();
    });

    it("não entra no chat com nome vazio", async () => {
        const setChatVisible = vi.fn();
        const user = userEvent.setup();
        render(<Join setSocket={() => {}} setChatVisible={setChatVisible} />);

        await user.click(screen.getByRole("button", { name: "Continuar" }));
        expect(setChatVisible).not.toHaveBeenCalled();
    });

    it("conecta ao socket e abre o chat", async () => {
        const setSocket = vi.fn();
        const setChatVisible = vi.fn();
        const user = userEvent.setup();
        render(<Join setSocket={setSocket} setChatVisible={setChatVisible} />);

        await user.type(screen.getByPlaceholderText("Username"), "Aluno");
        await user.click(screen.getByRole("button", { name: "Continuar" }));

        expect(socket.emit).toHaveBeenCalledWith("set_username", "Aluno");
        expect(setSocket).toHaveBeenCalledWith(socket);
        expect(setChatVisible).toHaveBeenCalledWith(true);
    });
});
