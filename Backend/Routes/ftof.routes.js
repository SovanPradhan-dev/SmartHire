import ftofmodel from "../Model/ftof.model.js";
import express from "express";
import auth from "../Middleware/auth.js";
import Score from "../Model/score.model.js";

const router = express.Router();

/* ---------------- GET QUESTIONS ---------------- */
router.get("/getques", async (req, res) => {
  try {
    const ques = await ftofmodel.aggregate([
      { $sample: { size: 10 } }
    ]);

    res.json(ques);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

/* ---------------- EVALUATE ANSWER ---------------- */
router.post("/evaluate", async (req, res) => {
  try {
    const { questionId, answer } = req.body;

    // 🔍 Find question from DB
    const question = await ftofmodel.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found",
      });
    }

    // 🧠 Simple keyword-based scoring
    let score = 0;
    let matchedKeywords = [];

    const userAns = answer.toLowerCase();

    question.keywords.forEach((keyword) => {
      if (userAns.includes(keyword.toLowerCase())) {
        score += 2; // each keyword = 2 marks
        matchedKeywords.push(keyword);
      }
    });

    // 🎯 Normalize score (max 10)
    score = Math.min(score, 10);

    // 💬 Feedback logic
    let feedback = "";
    if (score >= 8) feedback = "Excellent answer 🔥";
    else if (score >= 5) feedback = "Good answer 👍";
    else if (score > 0) feedback = "Partial answer, improve ⚡";
    else feedback = "Poor answer ❌";

    // 📤 Send response
    res.json({
      success: true,
      data: {
        score,
        feedback,
        matchedKeywords,
        correctAnswer: question.answer,
      },
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Evaluation failed",
    });
  }

});

router.patch("/submit",auth, async (req, res) => {
  const existing = await Score.findOne({ userId: req.user.userId });
  const { score } = req.body;
    if (existing) {
    existing.score_inter = score;
    await existing.save();

    return res.json({
        success: true,
        message: "Score updated",
        data: existing,
    });
    }
});
export default router;