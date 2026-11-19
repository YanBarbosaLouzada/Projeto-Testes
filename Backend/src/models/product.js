import mongoose from "mongoose";

const productModel = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 120 },
    mark: { type: String, trim: true, maxlength: 500 },
    color: { type: String, trim: true, maxlength: 500 },
    description: { type: String, trim: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true, maxlength: 2048 },
    type: { type: String, enum: ["masculino", "feminino", "outros"], default: "outros" },
    releaseDate: { type: Date, default: Date.now }
}, { timestamps: true });

productModel.index({ type: 1, createdAt: -1 });
productModel.index({ name: 1 });

export const Product = mongoose.model("product", productModel)