import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../pages/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import "./AdminLogin.css"; // Reuse the same styling

export default function CreateAdminAccount() {
  const [email, setEmail] = useState("admin@studyally.com");
  const [password, setPassword] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const createAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create the admin user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user profile
      await updateProfile(user, { 
        displayName: "StudyAlly Admin" 
      });

      // Create/update the user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: "StudyAlly Admin",
        email: email,
        role: "admin",
        isAdmin: true,
        createdAt: new Date().toISOString()
      });

      setSuccess(true);
      console.log("✅ Admin account created successfully!");
      console.log("Email:", email);
      console.log("Password:", password);
      console.log("UID:", user.uid);
      
    } catch (err) {
      console.error("❌ Error creating admin account:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("Admin account already exists! You can use the existing credentials to log in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(`Failed to create admin account: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-container">
          <div className="admin-login-box">
            <h2>✅ Admin Account Created!</h2>
            <div style={{ 
              background: "#f0f9ff", 
              border: "1px solid #0ea5e9", 
              borderRadius: "8px", 
              padding: "16px", 
              margin: "20px 0",
              textAlign: "left"
            }}>
              <h3>Admin Credentials:</h3>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Password:</strong> {password}</p>
            </div>
            <p>You can now log in to the admin panel using these credentials.</p>
            <div style={{ marginTop: "20px" }}>
              <a href="/admin/login" style={{ 
                background: "#6c5dd3", 
                color: "white", 
                padding: "12px 24px", 
                borderRadius: "8px", 
                textDecoration: "none",
                display: "inline-block"
              }}>
                Go to Admin Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-box">
          <h2>Create Admin Account</h2>
          <p className="admin-subtitle">
            This will create the dedicated admin account for StudyAlly.
          </p>

          {error && <div className="admin-error">{error}</div>}

          <form onSubmit={createAdmin}>
            <div className="admin-input-group">
              <label>Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="admin-input-group">
              <label>Admin Password</label>
              <input
                type="password"
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
              {loading ? "Creating Admin Account..." : "Create Admin Account"}
            </button>
          </form>

          <div className="admin-login-footer">
            <p>
              <a href="/admin/login">← Back to Admin Login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
