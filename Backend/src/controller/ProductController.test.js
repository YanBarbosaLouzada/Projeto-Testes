import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/product.js", () => ({
    Product: {
        find: jest.fn(),
        create: jest.fn(),
        findById: jest.fn(),
        findByIdAndDelete: jest.fn()
    }
}))

function criaRespostaMock() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

const { Product } = await import("../models/product.js")
const { default: ProductController } = await import("./ProductController.js");
const { default: UserController } = await import("./UserController.js");

describe("Testando se um user sem token pode fazer metodos com o deletar e editar", () => {
    it("Retorna um 401 quando esta sem autorição", () => {
        const req = { headers: {} };
        const res = criaRespostaMock();
        const next = jest.fn();

        UserController.authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalledWith();
    })
})