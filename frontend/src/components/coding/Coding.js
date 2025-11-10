import React, { useEffect, useState } from "react";
import axios from "axios";
import "./coding.css";

const Coding = () => {
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Fetch coding questions
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/coding/generate");
      setQuestions(res.data);
      setAnswers(Array(res.data.length).fill(""));
      setFeedback(null);
      setShowFeedback(false);
      setCurrent(0);
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleAnswerChange = (e) => {
    const newAnswers = [...answers];
    newAnswers[current] = e.target.value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handleSkip = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post("http://localhost:5000/api/coding/evaluate", {
        questions,
        answers,
      });
      setFeedback(res.data);
      setShowFeedback(false);
    } catch (err) {
      console.error("Error evaluating answers:", err);
      setFeedback([{ question: "Error", feedback: "Failed to get feedback." }]);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    fetchQuestions();
  };

  if (loading) return <div className="loading">🌀 Loading coding questions...</div>;

  // Feedback view
  if (feedback) {
    return (
      <div className="result-container">
        <h2>✅ AI Evaluation Completed!</h2>

        {!showFeedback ? (
          <div className="center-buttons">
            <button onClick={() => setShowFeedback(true)}>📋 Show Feedback</button>
            <button onClick={handleTryAgain} className="try-again">🔁 Try Again</button>
          </div>
        ) : (
          <>
            {feedback.map((f, i) => (
              <div key={i} className="result-card">
                <h4>{f.question}</h4>
                <p><strong>Score:</strong> {f.score}/10</p>
                <p><strong>Feedback:</strong> {f.feedback}</p>
              </div>
            ))}
            <div className="center-buttons">
              <button onClick={() => setShowFeedback(false)}>🙈 Hide Feedback</button>
              <button onClick={handleTryAgain} className="try-again">🔁 Try Again</button>
            </div>
          </>
        )}
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="coding-container">
      <h2>💻 Coding Challenge ({current + 1} / {questions.length})</h2>
      <div className="question-box">
        <h3>{q.title}</h3>
        <p>{q.question}</p>
        <div className="example">
          <p><strong>Example Input:</strong> {q.exampleInput}</p>
          <p><strong>Example Output:</strong> {q.exampleOutput}</p>
        </div>

        <textarea
          value={answers[current]}
          onChange={handleAnswerChange}
          placeholder="Write your answer here..."
        ></textarea>

        <div className="button-group">
          {current < questions.length - 1 ? (
            <>
              <button onClick={handleNext}>Next ➡️</button>
              <button onClick={handleSkip} className="skip">Skip ⏭️</button>
            </>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}>
              {submitting ? "Evaluating..." : "Submit 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Coding;
