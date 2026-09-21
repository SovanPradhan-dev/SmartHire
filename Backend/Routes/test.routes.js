import express from "express";
import Question from "../Model/test.model.js"; 
import auth from "../Middleware/auth.js";
import Score from "../Model/score.model.js"; 

const router = express.Router();

router.get("/questions", async (req, res) => {
  try {
    const questions = await Question.aggregate([{ $sample: { size: 5 } }]); 
    res.json(questions);
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ message: "Server Error" });
  }
});
router.post("/submit", auth, async (req, res) => {
  const { score } = req.body;

  console.log("User score:", score);
  const newsScore = new Score({
    userId: req.user.userId,
    score: score
  });

  await newsScore.save();
  res.json({ message: "Score received" });
});

router.get("/leaderboard", async (req, res) => {
  try {
    const leaderboard = await Score.find()
      .populate("userId", "username email") // get user name
      .sort({ score: -1 }) // highest score first
      .limit(10); // top 10

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


export default router; // ✅ proper ESM export
