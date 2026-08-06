import mongoose from "mongoose";

const user = new mongoose.Schema({
  role: {type:"String", default: "user"},
  name: String,
  age: Number,
  email: String,
  password:String,
  created_at:{type:Date, default: Date.now}
})

export const User = mongoose.model("user",user)