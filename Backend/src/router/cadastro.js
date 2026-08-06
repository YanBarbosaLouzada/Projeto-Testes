import { Router } from "express";
import cadastro from "../controller/cadastro.js";

const cadastroRouter = Router();

cadastroRouter.get("/verusuario", cadastro.verusuario);
cadastroRouter.post("/criarusuario", cadastro.criarusuario);
cadastroRouter.put("/editarusuario", cadastro.editarusuario);
cadastroRouter.delete("/deletarusuario/:id", cadastro.deletarusuario);

export default cadastroRouter;