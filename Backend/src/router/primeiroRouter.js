import { Router } from "express";
import primeiroController from "../controller/primeiroController.js";

const primeiroRouter = Router();

primeiroRouter.get("/olamundo", primeiroController.olamundo);

export default primeiroRouter;