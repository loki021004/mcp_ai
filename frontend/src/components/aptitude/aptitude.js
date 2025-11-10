import React, { useState } from "react";
import axios from "axios";
import "./aptitude.css";

const Aptitude = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // 🔹 Generate questions
  const generateQuestions = async () => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setScore(0);

    try {
      const res = await axios.post("http://localhost:5000/api/aptitude/generate");
      const formatted = (res.data || []).map((q) => ({
        question:
          typeof q.question === "object" && q.question !== null
            ? q.question.text || JSON.stringify(q.question)
            : q.question,
        options: q.options || {},
        correct: q.correct,
        explanation:
          typeof q.explanation === "object" && q.explanation !== null
            ? q.explanation.text || JSON.stringify(q.explanation)
            : q.explanation,
      }));
      setQuestions(formatted);
    } catch (err) {
      console.error("❌ Failed to load questions:", err.message);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Handle answer selection
  const handleAnswer = (qIndex, optionKey) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: optionKey }));
  };

  // 🔹 Submit answers
  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correct) correctCount++;
    });
    setScore(correctCount);
    setSubmitted(true);
  };

  return (
    <div className="aptitude-container">
      <h2>Aptitude Practice</h2>

      {!questions.length && !loading && (
        <button className="generate-btn" onClick={generateQuestions}>
          Generate 10 Questions
        </button>
       
      )}

      {loading && <p className="loading">🧠 Generating questions, please wait...</p>}

      {!loading && questions.length > 0 && (
        <div className="questions">
          {questions.map((q, i) => (
            <div key={i} className="question-card">
              <h3>
                {i + 1}. {q.question || "No question available"}
              </h3>

              {Object.entries(q.options).map(([key, value]) => (
                <label key={key} className="option">
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={key}
                    checked={answers[i] === key}
                    onChange={() => handleAnswer(i, key)}
                    disabled={submitted}
                  />
                  {key}. {String(value)}
                </label>
              ))}

              {submitted && (
                <p
                  className={`explanation ${
                    answers[i] === q.correct ? "correct" : "wrong"
                  }`}
                >
                  ✅ Correct: {q.correct} —{" "}
                  {q.explanation || "No explanation available"}
                </p>
              )}
            </div>
          ))}

          {!submitted ? (
            <button className="submit-btn" onClick={handleSubmit}>
              Submit Answers
            </button>
          ) : (
            <div className="result">
              🎯 You scored {score} / {questions.length}
              <br />
              <br />
              <button className="generate-btn" onClick={generateQuestions}>
                Try New Questions
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Aptitude;
