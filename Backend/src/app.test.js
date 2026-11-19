import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { app } from "./app.js";

describe("API security and error responses", () => {
    it("sets security headers and hides the Express signature", async () => {
        const response = await request(app).get("/missing");

        expect(response.status).toBe(404);
        expect(response.headers["x-content-type-options"]).toBe("nosniff");
        expect(response.headers["x-powered-by"]).toBeUndefined();
        expect(response.body.message).toBe("Rota não encontrada.");
    });

    it("allows only configured frontend origins", async () => {
        const allowed = await request(app).get("/missing").set("Origin", "http://localhost:5173");
        const rejected = await request(app).get("/missing").set("Origin", "https://untrusted.example");

        expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:5173");
        expect(rejected.headers["access-control-allow-origin"]).toBeUndefined();
    });
});
