const PRODUCT_TYPES = new Set(["masculino", "feminino", "outros"]);
const PRODUCT_FIELDS = new Set([
    "name",
    "mark",
    "color",
    "description",
    "price",
    "imageUrl",
    "type",
    "releaseDate"
]);
const MAX_TEXT_LENGTH = 500;

function isOptionalText(value) {
    return value === undefined
        || (typeof value === "string" && value.trim().length <= MAX_TEXT_LENGTH);
}

export function validateProductInput(product) {
    if (!product || typeof product !== "object" || Array.isArray(product)) {
        return "Dados do produto inválidos.";
    }
    if (Object.keys(product).some((field) => !PRODUCT_FIELDS.has(field))) {
        return "O produto contém campos não permitidos.";
    }
    if (typeof product.name !== "string" || !product.name.trim() || product.name.trim().length > 120) {
        return "Nome do produto é obrigatório e deve ter até 120 caracteres.";
    }
    for (const field of ["mark", "color", "description"]) {
        if (!isOptionalText(product[field])) {
            return `Campo ${field} deve ter até ${MAX_TEXT_LENGTH} caracteres.`;
        }
    }
    const validPriceType = typeof product.price === "number"
        || (typeof product.price === "string" && product.price.trim() !== "");
    if (!validPriceType || !Number.isFinite(Number(product.price)) || Number(product.price) < 0) {
        return "Preço deve ser um número igual ou maior que zero.";
    }
    if (product.type !== undefined && !PRODUCT_TYPES.has(product.type)) {
        return "Categoria de produto inválida.";
    }
    if (product.imageUrl !== undefined && product.imageUrl !== "") {
        try {
            const imageUrl = new URL(product.imageUrl);
            if (!["http:", "https:"].includes(imageUrl.protocol)) {
                return "URL da imagem inválida.";
            }
        } catch {
            return "URL da imagem inválida.";
        }
    }
    if (product.releaseDate !== undefined && Number.isNaN(Date.parse(product.releaseDate))) {
        return "Data de lançamento inválida.";
    }
    return null;
}

export function sanitizeProductInput(product) {
    return Object.fromEntries(
        Object.entries(product).filter(([field]) => PRODUCT_FIELDS.has(field))
    );
}
