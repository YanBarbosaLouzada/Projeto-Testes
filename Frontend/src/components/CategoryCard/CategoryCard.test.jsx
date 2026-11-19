import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CategoryCard from "./CategoryCard";

describe("CategoryCard", () => {
  it("mostra o rótulo e a contagem recebidos via props", () => {
    render(<CategoryCard icon={<span>🏷️</span>} label="Masculino" count={3} onClick={() => {}} />);

    expect(screen.getByText("Masculino")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("aplica a classe 'active' quando a prop active é verdadeira", () => {
    render(<CategoryCard label="Todos" count={5} active onClick={() => {}} />);

    expect(screen.getByRole("button", { name: /todos/i })).toHaveClass("active");
  });

  it("chama onClick quando o usuário clica no card", async () => {
    const aoClicar = vi.fn();
    const user = userEvent.setup();
    render(<CategoryCard label="Feminino" count={1} onClick={aoClicar} />);

    await user.click(screen.getByRole("button", { name: /feminino/i }));

    expect(aoClicar).toHaveBeenCalledTimes(1);
  });
});
