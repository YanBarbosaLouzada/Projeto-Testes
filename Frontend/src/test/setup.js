import "@testing-library/jest-dom/vitest";
import { beforeAll, afterEach, afterAll, vi } from "vitest";
import axios from "axios";
import { server } from "./server";

axios.defaults.adapter = "http";
Element.prototype.scrollIntoView = vi.fn();
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));
afterEach(() => server.resetHandlers());
afterAll(() =>  server.close());