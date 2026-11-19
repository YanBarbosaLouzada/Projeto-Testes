import { afterEach, describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { api, getApiErrorMessage } from "./api";
import { server } from "../test/server";

describe("API client", () => {
    afterEach(() => localStorage.removeItem("token"));

    it("adds the bearer token to authenticated requests", async () => {
        localStorage.setItem("token", "session-token");
        server.use(http.get("*/protected", ({ request }) => HttpResponse.json({
            authorization: request.headers.get("authorization")
        })));

        const { data } = await api.get("/protected");
        expect(data.authorization).toBe("Bearer session-token");
    });

    it("uses a safe fallback when an error has no API message", () => {
        expect(getApiErrorMessage(new Error("network"), "Falha temporária")).toBe("Falha temporária");
    });
});
