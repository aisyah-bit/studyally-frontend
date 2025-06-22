import React, { useState, useRef, useEffect } from "react";
import { auth, db } from "../pages/firebaseConfig";
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { NavLink } from "react-router-dom";
import {
  BookOpen, MapPin, Search, Plus,
  MessageSquare, User, Settings, LogOut
} from "lucide-react";
import logo from "../pages/logo.png";
import profilePic from "../pages/logo.png";
import {
  PeakStudyHourChart,
  SubjectPieChart,
  WeeklyGrowthChart,
  PopularSpotsChart,
  ActiveMembersChart,
  CollabTopicsChart
} from "../components/AnalyticsCharts";
import "./dashboard.css";

export default function Dashboard() {
  const [username, setUsername] = useState("Loading...");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [hourChartData, setHourChartData] = useState(null);
  const [subjectChartData, setSubjectChartData] = useState(null);
  const [growthChartData, setGrowthChartData] = useState(null);
  const [popularSpotsData, setPopularSpotsData] = useState(null);
  const [activeMembersData, setActiveMembersData] = useState(null);
  const [collabTopicsData, setCollabTopicsData] = useState(null);
  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  useEffect(() => {
    const fetchUsername = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUsername(docSnap.data().name || "User");
        }
      }
    };
    fetchUsername();
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

  useEffect(() => {
    const fetchUserAnalytics = async () => {
      const user = auth.currentUser;
      const studySpotMap = {};
      const groupMemberMap = {};
      const topicsMap = {};
      if (!user) return;

      const groupSnap = await getDocs(collection(db, "studyGroups"));
      const hourMap = new Array(24).fill(0);
      const subjectMap = {};
      const weeklyJoinMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (const groupDoc of groupSnap.docs) {
        const data = groupDoc.data();
        const isInGroup = data.creatorEmail === user.email || (data.joinedList || []).includes(user.email);
        if (isInGroup) {
          const subj = data.studySubject || "Unknown";
          subjectMap[subj] = (subjectMap[subj] || 0) + 1;

          const timestamps = data.joinedTimestamps || [];
          timestamps.forEach(entry => {
            if (entry.timestamp) {
              const date = entry.timestamp.toDate();
              const day = days[date.getDay()];
              weeklyJoinMap[day]++;
            }
          });

          const messagesSnap = await getDocs(collection(db, `chats/${groupDoc.id}/messages`));
          messagesSnap.forEach(msg => {
            const msgData = msg.data();
            if (msgData.sender === user.email) {
              const ts = msgData.timestamp?.toDate();
              if (ts) hourMap[ts.getHours()]++;
            }
          });
        }

        const spot = data.location || "Unknown Spot";
        studySpotMap[spot] = (studySpotMap[spot] || 0) + 1;

        const groupName = data.groupName || "Unnamed Group";
        const memberCount = (data.joinedList || []).length;
        groupMemberMap[groupName] = memberCount;

        const keywords = data.groupKeywords || [];
        keywords.forEach(k => topicsMap[k] = (topicsMap[k] || 0) + 1);

      }

      setHourChartData({
        labels: [...Array(24).keys()],
        datasets: [{
          label: 'Messages Sent',
          data: hourMap,
          backgroundColor: '#a855f7',
        }]
      });

      setSubjectChartData({
        labels: Object.keys(subjectMap),
        datasets: [{
          label: 'Study Groups',
          data: Object.values(subjectMap),
          backgroundColor: ['#f87171', '#facc15', '#34d399', '#60a5fa', '#c084fc']
        }]
      });

      setGrowthChartData({
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [{
          label: 'New Joins',
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => weeklyJoinMap[d]),
          borderColor: '#f59e0b',
          fill: false,
        }]
      });

      setPopularSpotsData({
  labels: Object.keys(studySpotMap),
  datasets: [{
    label: 'Visits',
    data: Object.values(studySpotMap),
    backgroundColor: '#60a5fa'
  }]
});

        setActiveMembersData({
          labels: Object.keys(groupMemberMap),
          datasets: [{
            label: 'Members',
            data: Object.values(groupMemberMap),
            backgroundColor: '#34d399'
          }]
        });

        setCollabTopicsData({
          labels: Object.keys(topicsMap),
          datasets: [{
            label: 'Mentions',
            data: Object.values(topicsMap),
            backgroundColor: '#f472b6'
          }]
        });

    };
    fetchUserAnalytics();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Top Bar */}
      <div className="top-bar">
        <div className="left-side">
          <img src={logo} alt="Logo" className="logo" />
          <span className="product-name">StudyAlly</span>
        </div>
        <div className="right-side">
          <span className="greeting">Hi, {username}</span>
          <div className="profile-dropdown" ref={dropdownRef}>
            <img src={profilePic} alt="Profile" className="profile-pic" onClick={toggleDropdown} />
            <div className={`dropdown-content ${dropdownOpen ? "open" : ""}`}>
              <NavLink to="/manage-profile"><Settings size={16} />Edit Profile</NavLink>
              <NavLink to="/logout"><LogOut size={16} />Logout</NavLink>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar + Main Content */}
      <div className="body-container">
        <aside className="sidebar">
          <ul className="nav-list">
            <li><NavLink to="/home" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><BookOpen /><span>Dashboard</span></NavLink></li>
            <li><NavLink to="/study-spots" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><MapPin /><span>Study Spots</span></NavLink></li>
            <li><NavLink to="/search-group" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Search /><span>Search Study Group</span></NavLink></li>
            <li><NavLink to="/create-group" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><Plus /><span>Create Study Group</span></NavLink></li>
            <li><NavLink to="/chats" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><MessageSquare /><span>Chats</span></NavLink></li>
            <li><NavLink to="/manage-profile" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}><User /><span>Manage Profile</span></NavLink></li>
          </ul>
        </aside>

        <main className="main-content">
          <div className="charts-section charts-full">
            {hourChartData && (
              <div className="chart-card">
                <h3 className="chart-title">⏰ Peak Study Hours</h3>
                <PeakStudyHourChart data={hourChartData} />
              </div>
            )}
            {subjectChartData && (
              <div className="chart-card">
                <h3 className="chart-title">📚 Most Common Subjects</h3>
                <SubjectPieChart data={subjectChartData} />
              </div>
            )}
            {growthChartData && (
              <div className="chart-card">
                <h3 className="chart-title">📈 Weekly Growth</h3>
                <WeeklyGrowthChart data={growthChartData} />
              </div>
            )}

            {popularSpotsData && (
            <div className="chart-card">
              <h3 className="chart-title">📍 Popular Study Spots</h3>
              <PopularSpotsChart data={popularSpotsData} />
            </div>
          )}
          {activeMembersData && (
            <div className="chart-card">
              <h3 className="chart-title">👥 Active Group Members</h3>
              <ActiveMembersChart data={activeMembersData} />
            </div>
          )}
          {collabTopicsData && (
            <div className="chart-card">
              <h3 className="chart-title">🧠 Top Collaboration Topics</h3>
              <CollabTopicsChart data={collabTopicsData} />
            </div>
          )}
          </div>
        </main>
      </div>
    </div>
  );
}
