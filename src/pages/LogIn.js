import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "../pages/firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import "../pages/LogIn.css"; 
import { Lock } from "lucide-react";

export default function LogIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    if (!email.endsWith("@gmail.com")) {
      setError("Only Gmail addresses are allowed.");
      return;
    }

    try {
      await signOut(auth); // clear previous sessions
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userRef);

      if (!docSnap.exists()) {
        setError("No profile found for this user.");
        return;
      }

      const userData = docSnap.data();
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("userName", userData.name || "");
      localStorage.setItem("userEmail", userData.email || "");

      const idToken = await user.getIdToken();
      await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      navigate("/manage-profile");
    } catch (err) {
      console.error("❌ Login error:", err);
      setError(err.message);
    }
  };

  return (
    <div className="forgot-container">
      <div className="forgot-box">
        <div className="lock-icon">
          <Lock size={28} color="#6c5dd3" strokeWidth={2.2} />
        </div>

        <h2>Log in</h2>
        <p className="subtitle">Enter your Gmail and password to continue.</p>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your Gmail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-button">Log In</button>

          <p className="back-to-login">
            <Link to="/forgot-password">← Forgot password?</Link>
          </p>
          <p className="signup-text">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
