import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Aptitude from "./components/aptitude/aptitude";
import Homepage from "./components/Homepage/Homepage";
import Coding from "./components/coding/Coding";
import ResumeAnalyzer from "./components/resume/resumeAnalyzer";
import InterviewAI from "./components/interview/InterviewAI";
import AIMentor from "./components/mentor/AIMentor";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/homepage" element={<Homepage />} />
        <Route path="/aptitude" element={<Aptitude />} />
        <Route path="/coding" element={<Coding />} />
        <Route path="/resume" element={<ResumeAnalyzer/>} />
        <Route path="/interview" element={<InterviewAI/>} />
        <Route path="/aimentor" element={<AIMentor />} />

      </Routes>
    </Router>
  );
};

export default App;
