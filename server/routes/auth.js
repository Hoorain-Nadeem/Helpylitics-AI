import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
const clean = (u) => {
  const o = u.toObject();
  delete o.password;
  return o;
};

router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ message: "Name, email and password are required" });
  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(409).json({ message: "Email is already registered" });
  const user = await User.create({
    name,
    email,
    password,
    role: ["need", "help", "both"].includes(role) ? role : "both",
  });
  res.status(201).json({ token: sign(user._id), user: clean(user) });
});

router.post("/login", async (req, res) => {
  const user = await User.findOne({
    email: (req.body.email || "").toLowerCase(),
  }).select("+password");
  if (!user || !(await user.matches(req.body.password || "")))
    return res.status(401).json({ message: "Invalid email or password" });
  res.json({ token: sign(user._id), user: clean(user) });
});

router.get("/me", protect, (req, res) => res.json(req.user));
export default router;
