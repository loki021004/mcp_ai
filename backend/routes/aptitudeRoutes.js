import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const prompt = `
Generate 10 mcq aptitude multiple choice questions in quantative and reasoning JSON format:
[
  {
    "question": "text",
    "options": {"A", "B", "C", "D"},
    "correct": "C",
    "explanation": "why it correct"
  }
]
Return only JSON, nothing else.
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

    let questions = [];
    try {
      questions = JSON.parse(jsonText);
    } catch (e) {
      console.error("JSON parse error:", e.message);
    }

    res.json(questions);
  } catch (err) {
    console.error("❌ Error generating questions:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to generate aptitude questions" });
  }
});

export default router;
