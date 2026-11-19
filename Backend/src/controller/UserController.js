import {User} from "../models/user.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validarCadastroUsuario } from "../validators/UserValidators.js";
import { getJwtSecret } from "../config/security.js";
import { logError } from "../utils/logger.js";

export default class UserController {
  static async LoginUser(req, res) {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = req.body?.password;

    try{
      if (!email || typeof password !== "string") {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
      }

      const user = await User.findOne({ email }).select("+password");
      if(!user){
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      const pass = await bcrypt.compare(password, user.password);

      if (!pass){
        return res.status(401).json({ message: "Credenciais inválidas." });
      }

      const token = jwt.sign({ userId: user._id }, getJwtSecret(), {
        expiresIn: "1h",
        algorithm: "HS256"
      });

      return res.status(200).json({ token });
    }catch(error){
      logError("Login failed", error, { path: req.path });
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  }

  static async RegisterUser(req, res) {
    const validationError = validarCadastroUsuario(req.body ?? {});
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    try{
      const { name, age, email, password } = req.body;
      const cryptPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
        name: name.trim(),
        age: Number(age),
        email: email.trim().toLowerCase(),
        password: cryptPassword
      });

      const createUser = await newUser.save()
      const safeUser = createUser.toObject ? createUser.toObject() : { ...createUser };
      delete safeUser.password;
      return res.status(200).json({
        message: "Usuário criado com sucesso!",
        data: safeUser,
      });
    }catch(error){
      if (error?.code === 11000) {
        return res.status(409).json({ message: "Já existe uma conta com este email." });
      }
      logError("Registration failed", error, { path: req.path });
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  }

  static authenticateToken(req, res, next) {
    const authorization = req.headers.authorization;
    const match = typeof authorization === "string" && authorization.match(/^Bearer\s+(\S+)$/i);
    if (!match) {
      return res.status(401).json({ message: "Autenticação Bearer obrigatória." });
    }

    try {
      jwt.verify(match[1], getJwtSecret(), { algorithms: ["HS256"] }, (error, user) => {
        if (error) {
          return res.status(403).json({ message: "Token inválido ou expirado." });
        }
        req.user = user;
        return next();
      });
    } catch (error) {
      logError("Token verification setup failed", error, { path: req.path });
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
  }
}