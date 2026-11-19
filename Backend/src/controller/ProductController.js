import { Product } from "../models/product.js";
import mongoose from "mongoose";
import { sanitizeProductInput, validateProductInput } from "../validators/ProductValidators.js";

export default class ProductController {
    static async getAllProducts(req, res) {
        const page = Number(req.query.page ?? "1");
        const limit = Number(req.query.limit ?? "20");
        const type = req.query.type;
        const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";

        if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
            return res.status(400).json({ message: "Parâmetros de paginação inválidos." });
        }
        if (type && !["masculino", "feminino", "outros"].includes(type)) {
            return res.status(400).json({ message: "Categoria de produto inválida." });
        }

        const filter = {};
        if (type) filter.type = type;
        if (search) filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };

        const [products, total] = await Promise.all([
            Product.find(filter)
                .select("name mark color description price imageUrl type releaseDate")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            Product.countDocuments(filter)
        ]);
        return res.json({
            products,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
        });
    }

    static async createdProduct(req, res) {
        const validationError = validateProductInput(req.body);
        if (validationError) return res.status(400).json({ message: validationError });

        const createdProduct = await Product.create(sanitizeProductInput(req.body));
        return res.json({ message: "Produto criado com sucesso!", data: createdProduct });
    }

    static async editProduct(req, res) {
        const { _id, ...changes } = req.body ?? {};
        const validationError = validateProductInput(changes);
        if (validationError) return res.status(400).json({ message: validationError });
        if (!mongoose.isValidObjectId(_id)) {
            return res.status(400).json({ message: "ID do produto inválido." });
        }
        const product = await Product.findById(_id);

        if (!product) {
            return res.status(404).json({ message: "Não existe um produto com este ID." });
        }

        Object.assign(product, sanitizeProductInput(changes));
        await product.save();
        return res.json({ message: "Editado com sucesso!", updatedProduct: product });
    }

    static async deleteProduct(req, res) {
        const { id } = req.params;
        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "ID do produto inválido." });
        }
        const deleted = await Product.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Produto não encontrado." });
        return res.json({ message: "Deletado com sucesso!" });
    }
}
