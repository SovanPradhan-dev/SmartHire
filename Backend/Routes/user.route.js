import express from "express";
import userModel from "../Model/user.model.js";
import jwt from "jsonwebtoken";
import authController from "../Controller/auth.controller.js";
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  await userModel.create({username, email, password });
  console.log(username, email, password);
  res.status(201).json({ message: "User registered" });
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  if (user.password !== password)
    return res.status(401).json({ message: "Incorrect password" });

  const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "5m" }
);


  res.json({
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email
    }
  });
});
router.post("/google/signin", authController.googleSignIn);
export default router;

