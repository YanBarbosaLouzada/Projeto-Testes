import {Router} from "express";
import UserController from "../controller/UserController.js";
import { loginRateLimiter, registerRateLimiter } from "../middleware/rateLimiters.js";

const userRouter = Router();

userRouter.post("/register", registerRateLimiter, UserController.RegisterUser)
userRouter.post("/login", loginRateLimiter, UserController.LoginUser)

export default userRouter;