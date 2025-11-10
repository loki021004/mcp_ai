import React, { useState } from "react";
import axios from "axios";
import "./resumeAnalyzer.css";

function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a resume first!");
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await axios.post("http://localhost:5000/api/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing resume");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-container">
      <h1>🧾 AI Resume Analyzer</h1>
      <p>Upload your resume in any format and get instant AI feedback.</p>

      <input type="file" onChange={handleFileChange} />
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      {result && (
        <div className="result-card">
          <h2>🎯 Score: {result.score}/100</h2>
          <p className="summary">{result.summary}</p>

          <div className="section">
            <h3>✅ Strengths</h3>
            <ul>{result.strengths?.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>

          <div className="section">
            <h3>⚠️ Weaknesses</h3>
            <ul>{result.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}</ul>
          </div>

          <div className="section">
            <h3>💡 Suggestions</h3>
            <ul>{result.suggestions?.map((s, i) => <li key={i}>{s}</li>)}</ul>
          </div>

          <button className="try-again" onClick={() => setResult(null)}>
            🔁 Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default ResumeAnalyzer;
