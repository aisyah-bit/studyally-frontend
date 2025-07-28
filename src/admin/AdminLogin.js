import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../pages/firebaseConfig.js";
import "./AdminLogin.css";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Admin email whitelist - only these emails can access admin
  const adminEmails = [
    "admin@studyally.com",
    "admin@gmail.com",
    "studyally.admin@gmail.com",
    "alyashauqi@gmail.com" // Temporary for testing
  ];

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    // Check if email is in admin whitelist
    if (!adminEmails.includes(email.toLowerCase())) {
      setError("Access denied. This email is not authorized for admin access.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store admin session
      localStorage.setItem("adminUid", user.uid);
      localStorage.setItem("adminEmail", user.email);
      localStorage.setItem("isAdmin", "true");

      navigate("/admin/dashboard");
    } catch (err) {
      console.error("❌ Admin login error:", err);
      if (err.code === "auth/user-not-found") {
        setError("Admin account not found.");
      } else if (err.code === "auth/wrong-password") {
        setError("Invalid password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-box">
          <div className="admin-lock-icon">
            <Shield size={32} color="#6c5dd3" strokeWidth={2.2} />
          </div>

          <h2>Admin Login</h2>
          <p className="admin-subtitle">
            Enter your admin credentials to access the StudyAlly admin panel.
          </p>

          {error && <div className="admin-error">{error}</div>}

          <form onSubmit={handleAdminLogin}>
            <div className="admin-input-group">
              <label>Admin Email</label>
              <input
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="admin-input-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button 
              type="submit" 
              className="admin-login-button"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In to Admin Panel"}
            </button>
          </form>

          <div className="admin-login-footer">
            <p>
              <a href="/login">← Back to Student Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
