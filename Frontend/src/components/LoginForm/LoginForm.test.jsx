import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event";
import LoginForm from "./LoginForm"

describe("LoginForm", () => {
    // render(<LoginForm loginHook={() => { }}></LoginForm>)
    // const campoEmail = screen.getByPlaceholderText("Email");
    // const campoSenha = screen.getByPlaceholderText("Senha");
    // const botaoEntrar = screen.getByRole("button", { name: /Entrar/i });

    it("Atualiza os campos conforme o usuário digita", async () => {
        render(<LoginForm loginHook={() => { }}></LoginForm>)
        const user = userEvent.setup();
        const campoEmail = screen.getByPlaceholderText("Email");

        await user.type(campoEmail, "aluno@mynds.com");

        expect(campoEmail).toHaveValue("aluno@mynds.com")

    })

    it("Chama loginHook com email e senha ao enviar o formulario", async () => {
        const funcaoFalsaDeLoginHook = vi.fn();
        const user = userEvent.setup();
        render(<LoginForm loginHook={funcaoFalsaDeLoginHook}></LoginForm>)

        const campoEmail = screen.getByPlaceholderText("Email");
        const campoSenha = screen.getByPlaceholderText("Senha");
        const botaoEntrar = screen.getByRole("button", { name: /Entrar/i });

        await user.type(campoEmail, "aluno@mynds.com")
        await user.type(campoSenha, "123456")
        await user.click(botaoEntrar)

        expect(funcaoFalsaDeLoginHook).toHaveBeenCalledWith({ email: "aluno@mynds.com", password: "123456" });


    })

    it("Não permite enviar o formulário com o e-mail vazio", async () => {

    })
})