import mongoose from "mongoose";

const user = new mongoose.Schema({
  role: { type: String, default: "user" },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  age: { type: Number, required: true, min: 0, max: 120 },
  email: { type: String, required: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false },
  created_at: { type: Date, default: Date.now }
}, {
  toJSON: {
    transform(_document, value) {
      delete value.password;
      return value;
    }
  }
});

user.index({ email: 1 }, { unique: true });

export const User = mongoose.model("user",user)