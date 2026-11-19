import { afterEach, describe, expect, it, jest } from "@jest/globals";
import { logError } from "./logger.js";

describe("structured error logger", () => {
    afterEach(() => jest.restoreAllMocks());

    it("writes structured error context without request payloads", () => {
        const output = jest.spyOn(console, "error").mockImplementation(() => {});
        logError("Request failed", new Error("database unavailable"), { path: "/products" });

        const entry = JSON.parse(output.mock.calls[0][0]);
        expect(entry).toMatchObject({
            level: "error",
            message: "Request failed",
            path: "/products",
            error: { name: "Error", message: "database unavailable" }
        });
        expect(entry.password).toBeUndefined();
    });
});
