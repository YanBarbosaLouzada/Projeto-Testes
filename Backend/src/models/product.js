import mongoose from "mongoose";

const productModel = new mongoose.Schema({
    name: String,
    mark: String,
    color: String,
    description: String,
    price: Number,
    imageUrl: String,
    type: { type: String,enum: ["masculino", "feminino", "outros"] },
    releaseDate: { type: Date, default: Date.now }
})

export const Product = mongoose.model("product", productModel)