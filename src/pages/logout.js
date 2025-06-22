import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../pages/firebaseConfig"; // adjust if needed

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const doLogout = async () => {
      try {
        await signOut(auth);
        localStorage.clear(); // optional: clear user data
        navigate("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

    doLogout();
  }, [navigate]);

  return <p>Logging out...</p>;
}
