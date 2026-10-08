import { beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.unstable_mockModule("../models/user.js", () => ({
    User: { findOne: jest.fn(), }
}));

jest.unstable_mockModule("bcrypt", () => ({
    default: { compare: jest.fn(), hash: jest.fn() }
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
    default: { sign: jest.fn(), verify: jest.fn() }
}));

const { User } = await import("../models/user.js");
const bcrypt = (await import("bcrypt")).default;
const jwt = (await import("jsonwebtoken")).default;
const { default: UserController } = await import("./UserController.js");

function criaRespostaMock() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("UserController.LoginUser", () => {
    beforeAll(() => {
        jest.clearAllMocks();
    })

    it("Testando quando o usuario nao existe", async () => {
        User.findOne.mockResolvedValue(null); // banco de dados 
        const req = { body: { email: "naoexiste@mynds.com", password: "123" } } // usuario vai escrever
        const res = criaRespostaMock(); // resposta do servidor

        await UserController.LoginUser(req, res) // função de login executando

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Usuario nao encontrado no DB" });
    })

    it("retorna 401 quando a senha está incorreta", async () => {
        User.findOne.mockResolvedValue({ _id: "1", email: "a@a.com", password: "hash" });
        bcrypt.compare.mockResolvedValue(false);
        const req = { body: { email: "a@a.com", password: "errada" } };
        const res = criaRespostaMock();

        await UserController.LoginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("Testando quando um usuario faz o login correto", async () => {
        User.findOne.mockResolvedValue({ _id: "2", email: "yan@gmail.com", password: "123" })
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("token-de-user");
        const req = { body: { email: "yan@gmail.com", password: "123" } }
        const res = criaRespostaMock()

        await UserController.LoginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: "token-de-user" })
    })
})