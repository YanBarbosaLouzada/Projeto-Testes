import {User} from "../models/user.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class UserController {
  static async LoginUser(req,res){
    const {email, password} = req.body;

    try{
      const user = await User.findOne({email});

      if(!user){
        return res.status(404).json({message:"Usuario nao encontrado no DB"})
      }

      const pass = await bcrypt.compare(password, user.password);

      if (!pass){
        return res.status(401).json({message:"Senha incorreta!"})
      }

      const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET,{ expiresIn:"1h" })

      return res.status(200).json({token})
    }catch(error){
      console.error("Erro ao fazer login:", error)
      return res.status(500).json({error:"Error interno do servidor"})
    }
  }

  static async RegisterUser(req,res) {
    const {name,age,email,password,confirmPassword} = req.body;

    if (confirmPassword !== password){
      return res.status(400).json({message:"As senhas são diferentes!"})
    }

    try{

      const cryptPassword = await bcrypt.hash(password,10);


      const newUser = new User({
        name,
        age,
        email,
        password: cryptPassword
      });

      const createUser = await newUser.save()

      return res.status(200).json({
        message:"Usuario criado com sucesso!",
        data: createUser,
      });

    }catch(error){
      console.error("Error ao registrar usuario", error);
      return res.status(500).json({error:"Erro interno do servidor"})
    }
  }

  static async authenticateToken(req,res,next) {
    const authHeader = req.headers["authorization"];

    if(authHeader == null){
      return res.status(401).json({message:"Sem token nao é permitido"})
    }

    jwt.verify(authHeader, process.env.JWT_SECRET, (err, user)=>{
      if (err){
        return res.status(403).json({message: "Token Inválido"});
      }
      req.user = user;
      next();
    })
  }
}