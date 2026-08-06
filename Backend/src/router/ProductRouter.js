import { Router } from "express";
import ProductController from "../controller/ProductController.js";
import UserController from "../controller/UserController.js";
const productRouter = Router();

productRouter.get("/", ProductController.getAllProducts);

productRouter.post("/create-product", UserController.authenticateToken ,ProductController.createdProduct );

productRouter.put("/edit-product",UserController.authenticateToken, ProductController.editProduct );

productRouter.delete("/delete-product/:id",UserController.authenticateToken, ProductController.deleteProduct );

export default productRouter;
