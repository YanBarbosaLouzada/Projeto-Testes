import { expect, jest } from "@jest/globals";
import UserController from "./UserController";

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

const { Product } = await import("../models/product.js");
const { default: ProductController } = await import("./ProductController.js");

describe("Testando se um user sem token pode fazer metodos como deletar e editar", () => {
    it("Retorna 401 quando esta sem autorização", () => {
        const req = { headers: {} };
        const res = criaRespostaMock();
        const next = jest.fn();

        UserController.authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalledWith();
    })
})