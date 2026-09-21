import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 * Paiza language mapping
 */
const LANGUAGE_MAP = {
  python: "python3",
  cpp: "cpp",
  javascript: "javascript",
};

/**
 * POST /api/run
 */
router.post("/run", async (req, res) => {
  const { code, language, input } = req.body;

  if (!code || !language) {
    return res.status(400).json({ error: "Code and language required" });
  }

  try {
    const createRes = await axios.post(
      "https://paiza-io.p.rapidapi.com/runners/create",
      {
        source_code: code,
        language: LANGUAGE_MAP[language],
        input: input || "",
      },
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "paiza-io.p.rapidapi.com",
          "Content-Type": "application/json",
        },
      }
    );

    const runnerId = createRes.data.id;
    if (!runnerId) {
      return res.status(500).json({ error: "Failed to create runner" });
    }

    let status = "running";
    let attempts = 0;

    while (status === "running" && attempts < 10) {
      await new Promise((r) => setTimeout(r, 1000));
      attempts++;

      const statusRes = await axios.get(
        "https://paiza-io.p.rapidapi.com/runners/get_status",
        {
          params: { id: runnerId },
          headers: {
            "X-RapidAPI-Key": process.env.RAPID_API_KEY,
            "X-RapidAPI-Host": "paiza-io.p.rapidapi.com",
          },
        }
      );

      status = statusRes.data.status;
    }

    /* 3️⃣ GET OUTPUT */
    const outputRes = await axios.get(
      "https://paiza-io.p.rapidapi.com/runners/get_details",
      {
        params: { id: runnerId },
        headers: {
          "X-RapidAPI-Key": process.env.RAPID_API_KEY,
          "X-RapidAPI-Host": "paiza-io.p.rapidapi.com",
        },
      }
    );

    const result = outputRes.data;

    res.json({
      output:
        result.stdout ||
        result.stderr ||
        result.build_stderr ||
        "No output",
    });
  } catch (error) {
    console.error("Execution error:", error.response?.data || error.message);
    res.status(500).json({ error: "Execution failed" });
  }
});

export default router;
