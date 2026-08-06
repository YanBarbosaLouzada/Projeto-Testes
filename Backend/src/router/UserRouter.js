import {Router} from "express";
import UserController from "../controller/UserController.js";

const userRouter = Router();

userRouter.post("/register",UserController.RegisterUser)
userRouter.post("/login", UserController.LoginUser)

export default userRouter;