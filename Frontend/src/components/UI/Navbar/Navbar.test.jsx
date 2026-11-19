import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Navbar from "./Navbar";

describe("Navbar", () => {
    it("mostra login quando não há token", () => {
        localStorage.removeItem("token");
        render(<MemoryRouter><Navbar /></MemoryRouter>);
        expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
    });

    it("faz logout e remove o token", async () => {
        localStorage.setItem("token", "token");
        const user = userEvent.setup();
        render(<MemoryRouter><Navbar /></MemoryRouter>);

        await user.click(screen.getByRole("button", { name: "Sair" }));
        expect(localStorage.getItem("token")).toBeNull();
    });
});
