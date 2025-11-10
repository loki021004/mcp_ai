import React, { useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";
import "./InterviewAI.css";

const InterviewAI = () => {
  const [questions, setQuestions] = useState([]);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [role, setRole] = useState("");
  const [skills, setSkills] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  };

  const uploadResume = async (e) => {
    const formData = new FormData();
    formData.append("resume", e.target.files[0]);
    const res = await axios.post("http://localhost:5000/api/interview/start", formData);
    setQuestions(res.data.questions);
    setRole(res.data.role);
    setSkills(res.data.skills);
    speak("Let's start the interview! " + res.data.questions[0]);
  };

  const handleNext = () => {
    setAnswers([...answers, transcript]);
    resetTranscript();
    if (step + 1 < questions.length) {
      setStep(step + 1);
      speak(questions[step + 1]);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    const res = await axios.post("http://localhost:5000/api/interview/evaluate", {
      role,
      skills,
      questions,
      answers,
    });
    setFeedback(res.data);
  };

  return (
    <div className="interview-container">
      <h2>🎤 AI Resume-Based Interview</h2>

      {!questions.length && (
        <div className="upload-section">
          <p>Upload your resume to begin:</p>
          <label className="upload-btn">
            Choose File
            <input type="file" onChange={uploadResume} />
          </label>
        </div>
      )}

      {questions.length > 0 && step < questions.length && (
        <div className="question-section">
          <h3>
            Q{step + 1}: <span>{questions[step]}</span>
          </h3>

          <div className="controls">
            <button
              className={`mic-btn ${listening ? "listening" : ""}`}
              onClick={SpeechRecognition.startListening}
            >
              🎙️ {listening ? "Listening..." : "Speak Answer"}
            </button>
            <button className="next-btn" onClick={handleNext}>
              Next ➡️
            </button>
          </div>

          <p className="answer">
            <strong>Your Answer:</strong> {transcript || "Start speaking..."}
          </p>
        </div>
      )}

     {feedback && (
  <div className="feedback-section">
    <h3>📊 Interview Feedback</h3>
    <div className="feedback-card">
      <p><strong>Overall Score:</strong> {feedback.overall_score}/100</p>
      <p><strong>Communication:</strong> {feedback.communication}</p>
      <p><strong>Technical Knowledge:</strong> {feedback.technical_knowledge}</p>
      <p><strong>Clarity:</strong> {feedback.clarity}</p>
      <p><strong>Grammar:</strong> {feedback.grammar}</p>
      <div className="feedback-text">
        <strong>Feedback:</strong>
        <p>{feedback.feedback}</p>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default InterviewAI;
