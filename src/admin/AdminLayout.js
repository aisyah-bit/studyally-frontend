import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../pages/firebaseConfig";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  LogOut,
  Shield
} from "lucide-react";
import logo from "../pages/logo.png";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get admin info from localStorage
    const email = localStorage.getItem("adminEmail");
    if (email) {
      setAdminEmail(email);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("adminUid");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("isAdmin");
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      path: "/admin/manage-groups",
      label: "Manage Groups",
      icon: <Users size={20} />,
    },
    {
      path: "/admin/manage-users",
      label: "Manage Users",
      icon: <UserCheck size={20} />,
    },
  ];

  return (
    <div className="admin-layout-page">
      <div className="admin-dashboard-container">
        {/* Top Bar */}
        <div className="admin-top-bar">
          <div className="admin-left-side">
            <img src={logo} alt="Logo" className="admin-logo" />
            <span className="admin-product-name">StudyAlly Admin</span>
          </div>
          <div className="admin-right-side">
            <span className="admin-greeting">
              Admin: {adminEmail.split("@")[0]}
            </span>
            <div className="admin-profile-dropdown" ref={dropdownRef}>
              <div
                className="admin-profile-pic"
                onClick={toggleDropdown}
              >
                <Shield size={20} color="#fff" />
              </div>
              <div className={`admin-dropdown-content ${dropdownOpen ? "open" : ""}`}>
                <button onClick={handleLogout} className="admin-dropdown-item">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Body with Sidebar */}
        <div className="admin-body-container">
          <aside className="admin-sidebar">
            <ul className="admin-nav-list">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => 
                      `admin-nav-link ${isActive ? "active" : ""}`
                    }
                  >
                    {item.icon}
                    <span className="admin-nav-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </aside>

          <main className="admin-main-content admin-frosted-glass">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
