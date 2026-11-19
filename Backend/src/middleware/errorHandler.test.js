import { describe, expect, it, jest } from "@jest/globals";
import { errorHandler, notFoundHandler } from "./errorHandler.js";

function responseMock() {
    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
        headersSent: false
    };
    return res;
}

describe("API error handlers", () => {
    it("returns a safe not-found response", () => {
        const res = responseMock();
        notFoundHandler({ method: "GET", path: "/missing" }, res);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ message: "Rota não encontrada." });
    });

    it("maps malformed JSON and large bodies to safe client errors", () => {
        const req = { method: "POST", path: "/products" };
        const malformed = responseMock();
        errorHandler({ type: "entity.parse.failed" }, req, malformed, jest.fn());
        expect(malformed.status).toHaveBeenCalledWith(400);

        const oversized = responseMock();
        errorHandler({ type: "entity.too.large" }, req, oversized, jest.fn());
        expect(oversized.status).toHaveBeenCalledWith(413);
    });

    it("passes errors onward when headers have already been sent", () => {
        const next = jest.fn();
        const res = responseMock();
        res.headersSent = true;
        const error = new Error("late error");
        errorHandler(error, {}, res, next);
        expect(next).toHaveBeenCalledWith(error);
    });

    it("hides internal details from server errors", () => {
        const output = jest.spyOn(console, "error").mockImplementation(() => {});
        const res = responseMock();
        errorHandler(new Error("secret database detail"), { method: "GET", path: "/products" }, res, jest.fn());
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: "Erro interno do servidor." });
        expect(output).toHaveBeenCalled();
        output.mockRestore();
    });
});
