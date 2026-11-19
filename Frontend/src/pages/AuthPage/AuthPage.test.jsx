import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import AuthPage from "./AuthPage";
import { server } from "../../test/server";

describe("AuthPage", () => {
    it("alterna entre registro e login", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><AuthPage /></MemoryRouter>);

        await user.click(screen.getByText(/já tem conta/i));
        expect(screen.getByRole("button", { name: /entrar/i })).toBeInTheDocument();

        await user.click(screen.getByText(/não tem conta/i));
        expect(screen.getByRole("button", { name: /registrar/i })).toBeInTheDocument();
    });

    it("faz login e adiciona o token", async () => {
        const user = userEvent.setup();
        render(<MemoryRouter><AuthPage /></MemoryRouter>);
        await user.click(screen.getByText(/já tem conta/i));

        await user.type(screen.getByPlaceholderText("Email"), "aluno@mynds.com");
        await user.type(screen.getByPlaceholderText("Senha"), "123456");
        await user.click(screen.getByRole("button", { name: /entrar/i }));

        await waitFor(() => expect(localStorage.getItem("token")).toBe("token-de-teste"));
    });

    it("mostra uma mensagem segura quando o login falha", async () => {
        const user = userEvent.setup();
        server.use(http.post("*/auth/login", () => HttpResponse.json(
            { message: "Credenciais inválidas." },
            { status: 401 }
        )));
        render(<MemoryRouter><AuthPage /></MemoryRouter>);
        await user.click(screen.getByText(/já tem conta/i));
        await user.type(screen.getByPlaceholderText("Email"), "aluno@mynds.com");
        await user.type(screen.getByPlaceholderText("Senha"), "senha-errada");
        await user.click(screen.getByRole("button", { name: /entrar/i }));

        expect(await screen.findByRole("alert")).toHaveTextContent("Credenciais inválidas.");
    });
});
