import express from "express";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
const router = express.Router();
const upload = multer({ dest: "uploads/" });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * 🧠 Route 1 — Analyze resume and generate AI interview questions
 */
router.post("/start", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No resume uploaded" });

    const resumeBuffer = fs.readFileSync(req.file.path);
    // Limit base64 size for safety (Llama token limit)
    const resumeBase64 = resumeBuffer.toString("base64").substring(0, 4000);

    const prompt = `
You are an expert technical interviewer.
Analyze this resume (base64 text truncated below), extract candidate's role, skills, experience, and domain.
Then generate 5 realistic interview questions — mix of HR, technical, and situational — suitable for this person.

Return only JSON like:
{
  "role": "Software Engineer",
  "skills": ["React", "Node.js", "MongoDB"],
  "questions": [
    "Can you describe a project where you used React?",
    "How do you handle state management in large React apps?",
    "Tell me about a challenging bug you fixed recently.",
    "How do you ensure code quality in your team?",
    "Where do you see yourself improving technically?"
  ]
}

Resume (base64 truncated):
${resumeBase64}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiText = completion.choices?.[0]?.message?.content || "";
    const jsonStart = aiText.indexOf("{");
    const jsonEnd = aiText.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === -1)
      throw new Error("Invalid JSON from model");

    const data = JSON.parse(aiText.slice(jsonStart, jsonEnd));

    // Cleanup uploaded file
    fs.unlinkSync(req.file.path);

    res.json(data);
  } catch (error) {
    console.error("❌ Error in /start:", error);
    res.status(500).json({ error: "Failed to generate interview questions" });
  }
});

/**
 * 🧩 Route 2 — Evaluate user's spoken answers
 */
router.post("/evaluate", async (req, res) => {
  try {
    const { role, skills, questions, answers } = req.body;

    if (!questions || !answers)
      return res.status(400).json({ error: "Missing questions or answers" });

    const prompt = `
You are an English communication and interview evaluator.
Evaluate the following interview for a ${role || "candidate"} position.

Skills: ${skills?.join(", ") || "N/A"}
Questions & Answers:
${questions
  .map((q, i) => `Q: ${q}\nA: ${answers[i] || "No answer"}`)
  .join("\n\n")}

Return only JSON:
{
  "overall_score": 86,
  "communication": 8.5,
  "technical_knowledge": 8.0,
  "clarity": 8.2,
  "grammar": 7.8,
  "feedback": "You explained projects well but use more technical depth next time."
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 800,
    });

    const aiText = completion.choices?.[0]?.message?.content || "";
    const jsonStart = aiText.indexOf("{");
    const jsonEnd = aiText.lastIndexOf("}") + 1;

    if (jsonStart === -1 || jsonEnd === -1)
      throw new Error("Invalid JSON from model");

    const data = JSON.parse(aiText.slice(jsonStart, jsonEnd));

    res.json(data);
  } catch (error) {
    console.error("❌ Error evaluating:", error);
    res.status(500).json({ error: "Failed to evaluate answers" });
  }
});

export default router;
