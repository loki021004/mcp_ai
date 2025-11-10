import React, { useEffect, useState } from "react";
import "./Homepage.css";
import { useNavigate } from "react-router-dom";

const Homepage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!userData || !token) {
      navigate("/login");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h2>Welcome, {user?.name || "Learner"} 👋</h2>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      <section className="dashboard-cards">
        <div className="card" onClick={() => navigate("/aptitude")}>
          <h3>📊 Aptitude</h3>
          <p>Practice logical & quantitative questions.</p>
        </div>

        <div className="card" onClick={() => navigate("/coding")}>
          <h3>💻 Coding</h3>
          <p>Solve coding challenges & get AI feedback.</p>
        </div>

        <div className="card" onClick={() => navigate("/resume")}>
          <h3>🧾 Resume Analyzer</h3>
          <p>Improve your resume using AI.</p>
        </div>

        <div className="card" onClick={() => navigate("/interview")}>
          <h3>🗣️ Communication</h3>
          <p>Improve your interview & speaking skills.</p>
        </div>
      </section>

      <section className="ai-mentor">
        <h3>🤖 Ask Your AI Mentor</h3>
        
        <button onClick={() => navigate("/aimentor")} className="ask-btn">
        Ask Mentor
        </button>
      </section>
    </div>
  );
};

export default Homepage;
