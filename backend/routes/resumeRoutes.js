import express from "express";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config();
const router = express.Router();
const upload = multer({ dest: "uploads/" });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // ✅ Convert file to base64 but truncate to avoid overflow
    const base64Resume = fileBuffer.toString("base64").substring(0, 4000);

    const prompt = `
You are an expert AI Resume Evaluator.
Analyze this resume (PDF or DOCX encoded below in base64 format).
Extract key text context and return ONLY JSON in this format:

{
  "score": out of 100,
  "summary": "Brief overview of the candidate",
  "strengths": ["strength all"],
  "weaknesses": ["weakness all"],
  "suggestions": ["suggestion all"]
}

Resume base64 (truncated):
${base64Resume}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a professional resume analyzer." },
        { role: "user", content: prompt },
      ],
    });

    const aiResponse = completion.choices?.[0]?.message?.content || "{}";
    const jsonStart = aiResponse.indexOf("{");
    const jsonEnd = aiResponse.lastIndexOf("}") + 1;
    const jsonString = aiResponse.slice(jsonStart, jsonEnd);

    const result = JSON.parse(jsonString);
    fs.unlinkSync(filePath);

    res.json(result);
  } catch (error) {
    console.error("❌ Error analyzing resume:", error.message);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

export default router;
