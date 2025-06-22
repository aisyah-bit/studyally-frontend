import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../pages/firebaseConfig.js";
import "../pages/ForgotPassword.css";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../pages/firebaseConfig.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");

  if (!email) {
    setError("Email is required.");
    return;
  }

  try {
    // 🔎 Check if the email exists in Firestore
    const usersRef = collection(db, "users"); // collection name
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      setError("No user found with this email.");
      return;
    }

    // ✅ Email exists, send reset email
    await sendPasswordResetEmail(auth, email);
    setMessage("✅ Password reset email sent!");
  } catch (err) {
    console.error("❌ Error:", err);
    setError(err.message);
  }
};


  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <div className="lock-icon">
          <Lock size={28} color="#6c5dd3" strokeWidth={2.2} />
        </div>

        <h2>Forgot your password?</h2>
        <p className="subtitle">Enter your email to reset it!</p>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form onSubmit={handleReset}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">Confirm</button>

          <p className="signup-text back-to-login">
            ← <Link to="/login">Return back to login page</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
