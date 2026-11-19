import { afterEach, describe, expect, it } from "@jest/globals";
import { getAllowedOrigins, getJwtSecret } from "./security.js";

describe("Security configuration", () => {
    const previousSecret = process.env.JWT_SECRET;
    const previousOrigins = process.env.CORS_ORIGINS;

    afterEach(() => {
        if (previousSecret === undefined) delete process.env.JWT_SECRET;
        else process.env.JWT_SECRET = previousSecret;
        if (previousOrigins === undefined) delete process.env.CORS_ORIGINS;
        else process.env.CORS_ORIGINS = previousOrigins;
    });

    it("rejects a missing or weak JWT secret", () => {
        delete process.env.JWT_SECRET;
        expect(() => getJwtSecret()).toThrow(/at least 32 characters/i);
        process.env.JWT_SECRET = "weak";
        expect(() => getJwtSecret()).toThrow(/at least 32 characters/i);
    });

    it("returns a configured JWT secret", () => {
        process.env.JWT_SECRET = "test-only-jwt-secret-at-least-32-characters";
        expect(getJwtSecret()).toBe(process.env.JWT_SECRET);
    });

    it("uses local origins by default and accepts an explicit allowlist", () => {
        delete process.env.CORS_ORIGINS;
        expect(getAllowedOrigins()).toContain("http://localhost:5173");
        process.env.CORS_ORIGINS = "https://shop.example, https://admin.example ";
        expect(getAllowedOrigins()).toEqual(["https://shop.example", "https://admin.example"]);
    });
});
