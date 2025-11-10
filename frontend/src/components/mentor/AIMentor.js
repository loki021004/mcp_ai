import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./AIMentor.css";

const AIMentor = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Hi! I'm your AI Mentor. Ask me about coding, aptitude, or interview prep!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/mentor/ask", {
        question: input,
      });

      const botMsg = { sender: "bot", text: res.data.reply || "No response received." };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errMsg = { sender: "bot", text: "⚠️ Error: Unable to connect to AI Mentor." };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="mentor-chat-container">
      <h2 className="chat-title">🤖 AI Mentor Chat</h2>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="typing">Mentor is typing...</div>}
        <div ref={chatEndRef} />
      </div>

      <div className="chat-input-box">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask your AI Mentor..."
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default AIMentor;
