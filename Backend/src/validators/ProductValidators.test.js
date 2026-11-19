import { describe, expect, it } from "@jest/globals";
import { sanitizeProductInput, validateProductInput } from "./ProductValidators.js";

describe("validateProductInput", () => {
    const validProduct = {
        name: "Camiseta",
        price: 59.9,
        type: "masculino",
        imageUrl: "https://example.com/image.jpg"
    };

    it("accepts a valid product", () => {
        expect(validateProductInput(validProduct)).toBeNull();
    });

    it("rejects missing names, negative prices, and unknown categories", () => {
        expect(validateProductInput({ ...validProduct, name: " " })).toMatch(/Nome/);
        expect(validateProductInput({ ...validProduct, price: -1 })).toMatch(/Preço/);
        expect(validateProductInput({ ...validProduct, price: "" })).toMatch(/Preço/);
        expect(validateProductInput({ ...validProduct, price: true })).toMatch(/Preço/);
        expect(validateProductInput({ ...validProduct, type: "unknown" })).toMatch(/Categoria/);
    });

    it("rejects unsafe or invalid image URLs and dates", () => {
        expect(validateProductInput({ ...validProduct, imageUrl: "javascript:alert(1)" })).toMatch(/URL/);
        expect(validateProductInput({ ...validProduct, releaseDate: "not-a-date" })).toMatch(/Data/);
    });

    it("rejects non-object payloads", () => {
        expect(validateProductInput(null)).toMatch(/inválidos/);
        expect(validateProductInput([])).toMatch(/inválidos/);
    });

    it("rejects fields outside the product contract", () => {
        expect(validateProductInput({ ...validProduct, isAdmin: true })).toMatch(/campos não permitidos/);
    });

    it("keeps only product fields when preparing data for persistence", () => {
        expect(sanitizeProductInput({ ...validProduct, _id: "attacker-controlled" })).not.toHaveProperty("_id");
    });
});
