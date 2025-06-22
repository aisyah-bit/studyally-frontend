import React, { useState, useEffect } from "react";
import Layout from "../components/layout";
import { db, auth } from "../pages/firebaseConfig";
import { useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  getDocs,
  collection
} from "firebase/firestore";
import "./searchGroup.css";
import {
  Search as SearchIcon,
  Filter,
  Target,
  Users,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  Star
} from "lucide-react";

export default function SearchGroup() {
  const [groupName, setGroupName] = useState("");
  const [matchedGroups, setMatchedGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("specific");
  const [activeType, setActiveType] = useState("study");
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserEmail(user.email);
        const userDocRef = doc(db, "profiles", user.uid);
        const snap = await getDoc(userDocRef);
        if (!snap.exists()) {
          await setDoc(userDocRef, {
            email: user.email,
            fullName: user.displayName || "",
            location: "",
            studySchedule: [],
            studySubjects: []
          });
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === "specific") setMatchedGroups([]);
    if (activeTab === "match") handleFilter();
  }, [activeType, activeTab]);

  const handleSearch = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      setMatchedGroups([]);
      return;
    }

    const snapshot = await getDocs(collection(db, "studyGroups"));
    const allGroups = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        joinedList: data.joinedList || [],
        inviteList: data.inviteList || []
      };
    });

    const firestoreType = activeType === "study" ? "general" : "assignment";

    const filtered = allGroups.filter(group => {
      const size = parseInt(group.groupSize || "0");
      const joined = group.joinedList.length;
      return (
        group.groupType?.toLowerCase() === firestoreType &&
        group.groupName?.toLowerCase().includes(trimmedName.toLowerCase()) &&
        size > 0 && joined < size
      );
    });

    setMatchedGroups(filtered);
  };

  const handleFilter = async () => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");

    try {
      const mappedType = activeType === "study" ? "general" : "assignment";
      const response = await fetch(`http://127.0.0.1:5000/recommendations?uid=${user.uid}&type=${mappedType}`);
      const data = await response.json();
      const validGroups = data.filter(group => {
        const size = parseInt(group.groupSize || "0");
        const joined = group.joinedList?.length || 0;
        return size > 0 && joined < size;
      });
      setMatchedGroups(validGroups);
    } catch (err) {
      console.error("Failed to fetch recommendations:", err);
    }
  };

  const handleJoin = async (groupId) => {
    const user = auth.currentUser;
    if (!user) return;
    const groupRef = doc(db, "studyGroups", groupId);
    const groupSnap = await getDoc(groupRef);
    if (!groupSnap.exists()) return;

    const groupData = groupSnap.data();
    const email = user.email;
    const alreadyJoined =
      groupData.creatorEmail === email ||
      groupData.joinedList?.includes(email) ||
      groupData.inviteList?.includes(email);

    if (!alreadyJoined) {
      await updateDoc(groupRef, { joinedList: arrayUnion(email) });
      alert("You've joined the group!");
      setMatchedGroups((prev) =>
        prev.map((g) =>
          g.id === groupId ? { ...g, joinedList: [...(g.joinedList || []), email] } : g
        )
      );
    }
    navigate(`/group-chat/${groupId}`);
  };

  return (
    <Layout>
      <div className="search-group-container">
        <div className="search-header">
          <h2 className="search-title">
            <SearchIcon /> Find Your Perfect Study Group
          </h2>
          <p className="search-subtitle">
            Connect with like-minded students and achieve your academic goals together
          </p>
        </div>

        <div className="group-type-selector" style={{ justifyContent: "center", display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <button className={`tab-btn ${activeType === "study" ? "active" : ""}`} onClick={() => setActiveType("study")}>
            <BookOpen size={18} /> Study Groups
          </button>
          <button className={`tab-btn ${activeType === "assignment" ? "active" : ""}`} onClick={() => setActiveType("assignment")}>
            <Target size={18} /> Assignment Groups
          </button>
        </div>

        <div className="tab-navigation">
          <button className={`tab-btn ${activeTab === "specific" ? "active" : ""}`} onClick={() => setActiveTab("specific")}> <Target /> Search Specific Group </button>
          <button className={`tab-btn ${activeTab === "match" ? "active" : ""}`} onClick={() => setActiveTab("match")}> <Filter /> Find Matching Groups </button>
        </div>

        {activeTab === "specific" && (
          <div className="search-form">
            <div className="form-header">
              <h3>Search for a Specific Group</h3>
              <p>Know the exact group you're looking for? Enter the group name below.</p>
            </div>
            <div className="form-grid" style={{ alignItems: "end" }}>
              <div className="form-group">
                <label><SearchIcon /> Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Enter group name..."
                  className="search-input"
                />
              </div>
              <button className="join-btn" onClick={handleSearch}>Search</button>
            </div>
          </div>
        )}

        <div className="results-section">
          <div className="results-header">
            <h3><Users /> Found {matchedGroups.length} Groups</h3>
          </div>

          {matchedGroups.length === 0 && (
            <p style={{ textAlign: "center", color: "#999", marginTop: "1rem" }}>
              No matching groups found.
            </p>
          )}

          <div className="group-grid">
            {userEmail && matchedGroups.map((group) => {
              const isCreator = group.creatorEmail === userEmail;
              const isJoined = (group.joinedList || []).includes(userEmail);
              const isInvited = (group.inviteList || []).includes(userEmail);
              const alreadyInGroup = isCreator || isJoined || isInvited;
              const groupSize = parseInt(group.groupSize || "0");
              const isFull = groupSize > 0 && (group.joinedList || []).length >= groupSize;

              return (
                <div key={group.id} className="group-card">
                  <div className="group-header">
                    <h4 className="group-name">{group.groupName}</h4>
                    <div className="group-type-badge">
                      <BookOpen /> {group.groupType || "study"}
                    </div>
                  </div>

                  <div className="group-details">
                    <div className="detail-item"><BookOpen /> <span>{group.studySubject}</span></div>
                    <div className="detail-item"><Calendar /> <span>{group.studyDay}</span></div>
                    <div className="detail-item"><Clock /> <span>{group.studyTime}</span></div>
                    <div className="detail-item"><MapPin /> <span>{group.location || "N/A"}</span></div>
                    <div className="detail-item match-score"><Star /> <span>Match: {(group.hybrid_score ? (group.hybrid_score * 100).toFixed(0) : "0")}%</span></div>
                  </div>

                  <div className="group-actions">
                    <button
                      className={`join-btn ${alreadyInGroup || isFull ? "joined" : ""}`}
                      disabled={alreadyInGroup || isFull}
                      onClick={() => !alreadyInGroup && !isFull && handleJoin(group.id)}
                    >
                      {alreadyInGroup ? "✓ Joined" : isFull ? "Full" : "Join Group"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}
