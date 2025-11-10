import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Generate 5 coding problems
router.post("/generate", async (req, res) => {
  try {
    const prompt = `
Generate 5 JavaScript or other coding problems with increasing difficulty.
Return ONLY JSON in this format:
[
  {
    "id": 1,
    "title": "Problem title",
    "question": "Explain the problem",
    "exampleInput": "Example input",
    "exampleOutput": "Expected output"
  }
]
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonStart = content.indexOf("[");
    const jsonEnd = content.lastIndexOf("]") + 1;
    const jsonText = content.slice(jsonStart, jsonEnd);
    const codingQuestions = JSON.parse(jsonText);

    res.json(codingQuestions);
  } catch (err) {
    console.error("❌ Error generating coding questions:", err.message);
    res.status(500).json({ error: "Failed to generate coding questions" });
  }
});

// Evaluate answers
router.post("/evaluate", async (req, res) => {
  try {
    const { questions, answers } = req.body;

    const prompt = `
You are an AI coding evaluator. Evaluate the following 5 coding answers.
Give a score out of 10 for each, and feedback.

Questions and answers:
${questions.map((q, i) => `Q${i + 1}: ${q.question}\nAnswer:\n${answers[i] || "Skipped"}\n`).join("\n")}

Return JSON only:
[
  {
    "question": "Q1 title",
    "score": 8,
    "feedback": "Explain reasoning and correctness"
  }
]
`;

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
      }
    );

    const content = response.data.choices[0].message.content;
    const jsonStart = content.indexOf("[");
    const jsonEnd = content.lastIndexOf("]") + 1;
    const jsonText = content.slice(jsonStart, jsonEnd);
    const evaluation = JSON.parse(jsonText);

    res.json(evaluation);
  } catch (err) {
    console.error("❌ Evaluation error:", err.message);
    res.status(500).json({ error: "Failed to evaluate answers" });
  }
});

export default router;
