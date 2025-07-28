import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  BookOpen,
  MapPin,
  Search,
  Plus,
  User,
  MessageSquare,
  Settings,
  LogOut
} from "lucide-react";
import { auth, db } from "../pages/firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import logo from "../pages/logo.png";
import "./layout.css";

const Layout = ({ children }) => {
  const [username, setUsername] = useState("User");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [chatLink, setChatLink] = useState("/search-group"); // Default if no group
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  useEffect(() => {
    const fetchUsername = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const name = userDoc.data().name;
          setUsername(name || "User");
        }
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    const fetchUserGroup = async () => {
      const user = auth.currentUser;
      if (user) {
        const groupSnapshot = await getDocs(collection(db, "studyGroups"));
        const userGroups = groupSnapshot.docs.filter((doc) => {
          const data = doc.data();
          return (
            data.creatorEmail === user.email ||
            data.joinedList?.includes(user.email)
          );
        });
        if (userGroups.length > 0) {
          setChatLink(`/group-chat/${userGroups[0].id}`);
        }
      }
    };
    fetchUserGroup();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { path: "/home", label: "Dashboard", icon: <BookOpen size={20} /> },
    { path: "/study-spots", label: "Study Spots", icon: <MapPin size={20} /> },
    { path: "/search-group", label: "Search Study Group", icon: <Search size={20} /> },
    { path: "/create-group", label: "Create Study Group", icon: <Plus size={20} /> },
    { path: chatLink, label: "Chats", icon: <MessageSquare size={20} /> },
    { path: "/manage-profile", label: "Manage Profile", icon: <User size={20} /> }
  ];

  // Get first letter of username for avatar
  const getFirstLetter = (name) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="layout-page">
      <div className="layout-container">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="left-side">
            <img src={logo} alt="Logo" className="logo" />
            <span className="product-name">StudyAlly</span>
          </div>
          <div className="right-side">
            <span className="greeting">Hi, {username.split(" ")[0]}</span>
            <div className="profile-dropdown" ref={dropdownRef}>
              <div
                className="profile-pic"
                onClick={toggleDropdown}
              >
                {getFirstLetter(username)}
              </div>
              <div className={`dropdown-content ${dropdownOpen ? "open" : ""}`}>
                <NavLink to="/manage-profile" className="dropdown-item">
                  <Settings size={16} /> Edit Profile
                </NavLink>
                <NavLink to="/logout" className="dropdown-item">
                  <LogOut size={16} /> Logout
                </NavLink>
              </div>
            </div>
          </div>
        </div>

        {/* Body with Sidebar */}
        <div className="body-container">
          <aside className="sidebar">
            <ul className="nav-list">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  >
                    {item.icon}
                    <span className="nav-label">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </aside>

          <main className="main-content frosted-glass">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
