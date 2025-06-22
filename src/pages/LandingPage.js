import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/signup");
  };

  return (
    <div className="landing-wrapper">
      <div className="landing-container">
        <div className="dots-bg" />

        <div className="content">
          {/* Left Section */}
          <div className="left">
            <h1>
              Where <span className="highlight">studies</span> come with ease
              <br /> with the help of an <span className="highlight">ally</span> in finding
              <br /> your favourite <span className="highlight">study places</span> and <span className="highlight">peers</span>.
            </h1>
            <p className="quote">
              "Teamwork makes the dream work"
              <br />– John C. Maxwell
            </p>
          </div>

          {/* Right Section */}
          <div className="right">
            <h2>
              STUDY <br /> <span>ALLY</span>
            </h2>
            <button
              onClick={handleGetStarted}
              className="get-started-btn"
            >
              GET STARTED
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
