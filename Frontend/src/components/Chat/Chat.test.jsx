import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Chat from "./Chat";

describe("Chat", () => {
    it("envia uma mensagem pelo socket", async () => {
        const socket = {
            id: "cliente",
            on: vi.fn(),
            off: vi.fn(),
            emit: vi.fn()
        };
        const user = userEvent.setup();
        render(<Chat socket={socket} />);

        await user.type(screen.getByPlaceholderText(/digite sua mensagem/i), "Olá");
        await user.click(screen.getByRole("button", { name: /enviar mensagem/i }));

        expect(socket.emit).toHaveBeenCalledWith("message", "Olá");
    });

    it("exibe mensagem recebida pelo socket", () => {
        let receberMensagem;
        const socket = {
            id: "cliente",
            on: vi.fn((evento, callback) => {
                if (evento === "receive_message") receberMensagem = callback;
            }),
            off: vi.fn(),
            emit: vi.fn()
        };
        render(<Chat socket={socket} />);

        act(() => {
            receberMensagem({
                authorId: "outro",
                author: "Suporte",
                text: "Como posso ajudar?"
            });
        });

        expect(screen.getByText("Suporte")).toBeInTheDocument();
        expect(screen.getByText("Como posso ajudar?")).toBeInTheDocument();
    });
});
