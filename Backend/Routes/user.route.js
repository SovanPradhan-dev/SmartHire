import express from "express";
import userModel from "../Model/user.model.js";
import jwt from "jsonwebtoken";
import router from "express"
import {
    googleLogin,
    googleCallback
} from "../Controller/Auth.controller.js";

const router = express.Router();

router.get("/google", googleLogin);

router.get("/google/callback", googleCallback);

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  await userModel.create({username, email, password });
  console.log(username, email, password);
  res.status(201).json({ message: "User registered" });
});

router.get("/profile", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    const user = await userModel.findById(decoded.userId).select("username email phone quizScore interviewsAttended performanceRating -_id");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

router.get("/users", async (req, res) => {
    const users = await userModel
      .find()
      .select("username email -_id");

    res.status(200).json(users);
})


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

