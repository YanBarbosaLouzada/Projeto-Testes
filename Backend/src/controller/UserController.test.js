import { beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';

const User = jest.fn(function UserMock(data = {}) {
    Object.assign(this, data);
});
User.findOne = jest.fn();

jest.unstable_mockModule("../models/user.js", () => ({ User }));

jest.unstable_mockModule("bcrypt", () => ({
    default: { compare: jest.fn(), hash: jest.fn() }
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
    default: { sign: jest.fn(), verify: jest.fn() }
}));

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

    describe("UserController.RegisterUser", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it("rejeita senhas diferentes", async () => {
            const res = criaRespostaMock();
            await UserController.RegisterUser({
                body: { name: "Aluno", age: 20, email: "aluno@mynds.com", password: "SenhaForte1234", confirmPassword: "diferente" }
            }, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "As senhas são diferentes." });
        });

        it("rejeita email inválido", async () => {
            const res = criaRespostaMock();
            await UserController.RegisterUser({
                body: { name: "Aluno", age: 20, email: "email-invalido", password: "SenhaForte1234", confirmPassword: "SenhaForte1234" }
            }, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("rejeita idade inválida", async () => {
            const res = criaRespostaMock();
            await UserController.RegisterUser({
                body: { name: "Aluno", age: 121, email: "aluno@mynds.com", password: "SenhaForte1234", confirmPassword: "SenhaForte1234" }
            }, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it("cria um usuário com senha criptografada", async () => {
            bcrypt.hash.mockResolvedValue("hash-seguro");
            const res = criaRespostaMock();
            const novoUsuario = {
                save: jest.fn().mockResolvedValue({
                    name: "Aluno",
                    age: 20,
                    email: "aluno@mynds.com",
                    password: "hash-seguro"
                })
            };
            User.mockImplementation(() => novoUsuario);

            await UserController.RegisterUser({
                body: { name: "Aluno", age: 20, email: "aluno@mynds.com", password: "SenhaForte1234", confirmPassword: "SenhaForte1234" }
            }, res);

            expect(bcrypt.hash).toHaveBeenCalledWith("SenhaForte1234", 12);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.not.objectContaining({ password: expect.anything() })
            }));
        });
    })

    it("Testando quando o usuario nao existe", async () => {
        User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) }); // banco de dados
        const req = { body: { email: "naoexiste@mynds.com", password: "123" } } // usuario vai escrever
        const res = criaRespostaMock(); // resposta do servidor

        await UserController.LoginUser(req, res) // função de login executando

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: "Credenciais inválidas." });
    })

    it("retorna 401 quando a senha está incorreta", async () => {
        User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "1", email: "a@a.com", password: "hash" }) });
        bcrypt.compare.mockResolvedValue(false);
        const req = { body: { email: "a@a.com", password: "errada" } };
        const res = criaRespostaMock();

        await UserController.LoginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
    });

    it("Testando quando um usuario faz o login correto", async () => {
        User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: "2", email: "yan@gmail.com", password: "123" }) })
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue("token-de-user");
        const req = { body: { email: "yan@gmail.com", password: "123" } }
        const res = criaRespostaMock()

        await UserController.LoginUser(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ token: "token-de-user" })
    })

    it("returns a generic server error when the user store fails", async () => {
        User.findOne.mockReturnValue({ select: jest.fn().mockRejectedValue(new Error("db error")) });
        const output = jest.spyOn(console, "error").mockImplementation(() => {});
        const res = criaRespostaMock();

        await UserController.LoginUser({ body: { email: "a@a.com", password: "pass" }, path: "/auth/login" }, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Erro interno do servidor." });
        output.mockRestore();
    });
})

describe("UserController.authenticateToken", () => {
    beforeEach(() => jest.clearAllMocks());

    it("accepts a valid Bearer token and attaches the user", () => {
        jwt.verify.mockImplementation((_token, _secret, _options, callback) => {
            callback(null, { userId: "user-1" });
        });
        const req = { headers: { authorization: "Bearer valid-token" }, path: "/products" };
        const res = criaRespostaMock();
        const next = jest.fn();

        UserController.authenticateToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(
            "valid-token",
            expect.any(String),
            { algorithms: ["HS256"] },
            expect.any(Function)
        );
        expect(req.user).toEqual({ userId: "user-1" });
        expect(next).toHaveBeenCalled();
    });

    it("rejects malformed or invalid Bearer tokens", () => {
        const missing = criaRespostaMock();
        UserController.authenticateToken({ headers: {} }, missing, jest.fn());
        expect(missing.status).toHaveBeenCalledWith(401);

        jwt.verify.mockImplementation((_token, _secret, _options, callback) => {
            callback(new Error("invalid token"));
        });
        const invalid = criaRespostaMock();
        UserController.authenticateToken({ headers: { authorization: "Bearer invalid" }, path: "/products" }, invalid, jest.fn());
        expect(invalid.status).toHaveBeenCalledWith(403);
    });
})