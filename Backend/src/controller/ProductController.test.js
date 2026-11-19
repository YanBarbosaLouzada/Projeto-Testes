import { expect, jest } from "@jest/globals";

const Product = jest.fn(function ProductMock(data = {}) {
    Object.assign(this, data);
});
Product.find = jest.fn();
Product.countDocuments = jest.fn();
Product.create = jest.fn();
Product.findById = jest.fn();
Product.findByIdAndDelete = jest.fn();

jest.unstable_mockModule("../models/product.js", () => ({ Product }));

function criaRespostaMock() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

const { default: ProductController } = await import("./ProductController.js");

describe("ProductController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("lista todos os produtos", async () => {
        const products = [{ name: "Camiseta" }];
        Product.find.mockReturnValue({
            select: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            skip: jest.fn().mockReturnThis(),
            limit: jest.fn().mockReturnThis(),
            lean: jest.fn().mockResolvedValue(products)
        });
        Product.countDocuments.mockResolvedValue(1);
        const res = criaRespostaMock();

        await ProductController.getAllProducts({ query: {} }, res);

        expect(res.json).toHaveBeenCalledWith({
            products,
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        });
    });

    it("cria um produto com os dados enviados", async () => {
        const req = {
            body: {
                name: "Camiseta",
                mark: "Mynds",
                color: "Azul",
                description: "Básica",
                price: 59.9,
                imageUrl: "https://example.com/camiseta.png",
                type: "masculino"
            }
        };
        const res = criaRespostaMock();
        Product.create.mockResolvedValue({ _id: "1", ...req.body });

        await ProductController.createdProduct(req, res);

        expect(Product.create).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            message: "Produto criado com sucesso!",
            data: expect.objectContaining({ name: "Camiseta" })
        });
    });

    it("retorna mensagem quando o produto editado não existe", async () => {
        const res = criaRespostaMock();
        Product.findById.mockResolvedValue(null);

        await ProductController.editProduct({
            body: {
                _id: "a".repeat(24),
                name: "Camiseta",
                price: 20
            }
        }, res);

        expect(res.status).toHaveBeenCalledWith(404);
    });

    it("edita e retorna o produto atualizado", async () => {
        const product = { save: jest.fn() };
        const id = "a".repeat(24);
        Product.findById.mockResolvedValue(product);
        const res = criaRespostaMock();

        await ProductController.editProduct({
            body: {
                _id: id,
                name: "Nova camiseta",
                mark: "Mynds",
                color: "Preta",
                description: "Nova",
                price: 79.9,
                imageUrl: "https://example.com/nova.png",
                type: "masculino",
                releaseDate: "2026-01-01"
            }
        }, res);

        expect(product.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({
            message: "Editado com sucesso!",
            updatedProduct: expect.objectContaining({ name: "Nova camiseta" })
        });
    });

    it("deleta o produto pelo id", async () => {
        const res = criaRespostaMock();

        const id = "a".repeat(24);
        Product.findByIdAndDelete.mockResolvedValue({ _id: id });
        await ProductController.deleteProduct({ params: { id } }, res);

        expect(Product.findByIdAndDelete).toHaveBeenCalledWith(id);
        expect(res.json).toHaveBeenCalledWith({ message: "Deletado com sucesso!" });
    });

    it("rejeita parâmetros de paginação inválidos", async () => {
        const res = criaRespostaMock();

        await ProductController.getAllProducts({ query: { page: "1abc", limit: "20" } }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(Product.find).not.toHaveBeenCalled();
    });

    it("valida o produto antes de gravá-lo", async () => {
        const res = criaRespostaMock();

        await ProductController.createdProduct({ body: { name: "", price: -1 } }, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(Product.create).not.toHaveBeenCalled();
    });
})