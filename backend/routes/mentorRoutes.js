import express from "express";
import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ reply: "Please provide a question." });
    }

    console.log("🧠 Question received:", question);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // ✅ stable model
      messages: [
        {
          role: "system",
          content:
            "You are an experienced AI mentor who explains coding, aptitude, and interview questions clearly and helpfully.",
        },
        { role: "user", content: question },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "No response generated.";
    console.log("🤖 Mentor reply:", reply);

    res.json({ reply });
  } catch (error) {
    console.error("❌ AI Mentor Error:", error.message);
    res.status(500).json({ reply: "Error: Unable to generate response." });
  }
});

export default router;
