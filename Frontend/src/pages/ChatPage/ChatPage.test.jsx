import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import ChatPage from "./ChatPage";

describe("ChatPage", () => {
    it("inicia mostrando a tela de entrada do chat", () => {
        render(<ChatPage />);
        expect(screen.getByText("Coloque um nome para continuar")).toBeInTheDocument();
    });
});
