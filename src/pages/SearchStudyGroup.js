import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const groupGridRef = useRef(null);
  const navigate = useNavigate();

  // Enhanced scroll handling with performance optimization
  const handleScroll = useCallback((e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    // Calculate scroll percentage
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
    setScrollPosition(scrollPercentage);

    // Show scroll indicator when there's scrollable content
    setShowScrollIndicator(scrollHeight > clientHeight);
  }, []);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    if (groupGridRef.current) {
      groupGridRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (groupGridRef.current) {
      groupGridRef.current.scrollTo({
        top: groupGridRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Scroll up function (smooth incremental scroll)
  const scrollUp = useCallback(() => {
    if (groupGridRef.current) {
      groupGridRef.current.scrollBy({
        top: -300,
        behavior: 'smooth'
      });
    }
  }, []);

  // Scroll down function (smooth incremental scroll)
  const scrollDown = useCallback(() => {
    if (groupGridRef.current) {
      groupGridRef.current.scrollBy({
        top: 300,
        behavior: 'smooth'
      });
    }
  }, []);

  // Keyboard navigation for grid
  const handleKeyNavigation = useCallback((e) => {
    if (!groupGridRef.current) return;

    const container = groupGridRef.current;
    const scrollAmount = 200;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        container.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        break;
      case 'ArrowUp':
        e.preventDefault();
        container.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
        break;
      case 'PageDown':
        e.preventDefault();
        container.scrollBy({ top: container.clientHeight * 0.8, behavior: 'smooth' });
        break;
      case 'PageUp':
        e.preventDefault();
        container.scrollBy({ top: -container.clientHeight * 0.8, behavior: 'smooth' });
        break;
      case 'Home':
        e.preventDefault();
        scrollToTop();
        break;
      case 'End':
        e.preventDefault();
        scrollToBottom();
        break;
    }
  }, [scrollToTop, scrollToBottom]);



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
    console.log(`Tab changed to: ${activeTab}, Type: ${activeType}`);
    if (activeTab === "specific") {
      setMatchedGroups([]);
      console.log("Cleared groups for specific search tab");
    }
    if (activeTab === "match") {
      console.log("Loading groups for match tab");
      handleFilter();
    }
  }, [activeType, activeTab]);

  const handleSearch = async () => {
    const trimmedName = groupName.trim();
    if (!trimmedName) {
      setMatchedGroups([]);
      return;
    }

    try {
      const snapshot = await getDocs(collection(db, "studyGroups"));
      const allGroups = snapshot.docs.map(doc => {
        const data = doc.data();

        // Parse joinedList and inviteList if they're stored as strings
        let joinedList = data.joinedList || [];
        let inviteList = data.inviteList || [];

        if (typeof joinedList === 'string') {
          try {
            joinedList = JSON.parse(joinedList);
          } catch (e) {
            joinedList = [];
          }
        }

        if (typeof inviteList === 'string') {
          try {
            inviteList = JSON.parse(inviteList);
          } catch (e) {
            inviteList = [];
          }
        }

        return {
          id: doc.id,
          ...data,
          joinedList,
          inviteList
        };
      });

      const firestoreType = activeType === "study" ? "general" : "assignment";

      // Include ALL groups that match the search criteria, regardless of status
      const filtered = allGroups.filter(group => {
        return (
          group.groupType?.toLowerCase() === firestoreType &&
          group.groupName?.toLowerCase().includes(trimmedName.toLowerCase())
        );
      });

      console.log(`Found ${filtered.length} groups matching search criteria`);
      setMatchedGroups(filtered);
    } catch (error) {
      console.error("Error searching groups:", error);
      alert("Failed to search groups. Please try again.");
    }
  };

  const handleFilter = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    try {
      const mappedType = activeType === "study" ? "general" : "assignment";

      // Try to fetch from recommendations API first
      try {
        const response = await fetch(`http://127.0.0.1:5000/recommendations?uid=${user.uid}&type=${mappedType}`);
        if (response.ok) {
          const data = await response.json();
          // Include ALL groups from recommendations, regardless of status
          console.log(`Found ${data.length} groups from recommendations API`);
          const groupsWithScore = data.map(group => ({
            ...group,
            hybrid_score: typeof group.hybrid_score === 'number' ? group.hybrid_score : null
          }));
          setMatchedGroups(groupsWithScore);
          return;
        }
      } catch (apiError) {
        console.warn("Recommendations API not available, falling back to Firestore:", apiError);
      }

      // Fallback to direct Firestore query if API is not available
      const snapshot = await getDocs(collection(db, "studyGroups"));
      const allGroups = snapshot.docs.map(doc => {
        const data = doc.data();

        // Parse joinedList and inviteList if they're stored as strings
        let joinedList = data.joinedList || [];
        let inviteList = data.inviteList || [];

        if (typeof joinedList === 'string') {
          try {
            joinedList = JSON.parse(joinedList);
          } catch (e) {
            joinedList = [];
          }
        }

        if (typeof inviteList === 'string') {
          try {
            inviteList = JSON.parse(inviteList);
          } catch (e) {
            inviteList = [];
          }
        }

        return {
          id: doc.id,
          ...data,
          joinedList,
          inviteList,
          hybrid_score: null
        };
      });

      // Filter by type only, include ALL groups regardless of status
      const filteredGroups = allGroups.filter(group =>
        group.groupType?.toLowerCase() === mappedType
      );

      console.log(`Found ${filteredGroups.length} groups of type ${mappedType} from Firestore`);
      setMatchedGroups(filteredGroups);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      alert("Failed to load study groups. Please try again.");
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
      <div className="search-group-page">
        <div className="search-group-container">
        <div className="search-header">
          <h2 className="search-title">
            <SearchIcon /> Study Groups
          </h2>
        </div>

        <div className="group-type-selector">
          <button className={`tab-btn ${activeType === "study" ? "active" : ""}`} onClick={() => setActiveType("study")}>
            <BookOpen size={18} /> Study
          </button>
          <button className={`tab-btn ${activeType === "assignment" ? "active" : ""}`} onClick={() => setActiveType("assignment")}>
            <Target size={18} /> Assignment
          </button>
        </div>

        <div className="tab-navigation">
          <button className={`tab-btn ${activeTab === "specific" ? "active" : ""}`} onClick={() => setActiveTab("specific")}>
            <Target size={16} /> Search
          </button>
          <button className={`tab-btn ${activeTab === "match" ? "active" : ""}`} onClick={() => setActiveTab("match")}>
            <Filter size={16} /> Browse
          </button>
        </div>

        {activeTab === "specific" && (
          <div className="search-form">
            <div className="form-header">
              <h3>Find Group</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label><SearchIcon size={16} /> Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Group name"
                  className="search-input"
                />
              </div>
              <button className="search-btn" onClick={handleSearch}>Search</button>
            </div>
          </div>
        )}

        <div className="results-section">
          {matchedGroups.length === 0 ? (
            <div className="no-results">
              No groups found
            </div>
          ) : (
            <div className="group-grid-container">
              {/* Dedicated Scroll Navigation Buttons */}
              {showScrollIndicator && (
                <div className="scroll-navigation">
                  <button
                    className="scroll-nav-btn scroll-up-btn"
                    onClick={scrollUp}
                    aria-label="Scroll up through results"
                    title="Scroll Up"
                    disabled={scrollPosition <= 5}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16.59 15.41L12 10.83l-4.59 4.58L6 14l6-6 6 6-1.41 1.41z"/>
                    </svg>
                    <span>Up</span>
                  </button>
                  <button
                    className="scroll-nav-btn scroll-down-btn"
                    onClick={scrollDown}
                    aria-label="Scroll down through results"
                    title="Scroll Down"
                    disabled={scrollPosition >= 95}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                    </svg>
                    <span>Down</span>
                  </button>
                </div>
              )}

              <div
                className="group-grid"
                ref={groupGridRef}
                onScroll={handleScroll}
                onKeyDown={handleKeyNavigation}
                tabIndex="0"
                role="region"
                aria-label="Study groups search results"
              >
                {userEmail && matchedGroups.map((group) => {
              const isCreator = group.creatorEmail === userEmail;
              const isJoined = (group.joinedList || []).includes(userEmail);
              const isInvited = (group.inviteList || []).includes(userEmail);
              const alreadyInGroup = isCreator || isJoined || isInvited;
              const groupSize = parseInt(group.groupSize || "0");
              // Include creator in member count for capacity checking
              const currentMemberCount = (group.joinedList || []).length + 1;
              const isFull = groupSize > 0 && currentMemberCount >= groupSize;

              return (
                <div key={group.id} className="group-card">
                  <div className="group-header">
                    <h4 className="group-name">{group.groupName}</h4>
                    <div className="group-badges">
                      <div className="group-type-badge">
                        <BookOpen size={14} /> {group.groupType || "general"}
                      </div>
                      {isFull && (
                        <div className="status-badge full">
                          Full
                        </div>
                      )}
                      {alreadyInGroup && !isFull && (
                        <div className="status-badge joined">
                          {isCreator ? "Creator" : "Joined"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Group Description - Display if available */}
                  {group.description && (
                    <div className="group-description">
                      <p>{group.description}</p>
                    </div>
                  )}

                  <div className="group-details">
                    <div className="detail-item">
                      <BookOpen size={16} />
                      <span>{group.studySubject}</span>
                    </div>
                    <div className="detail-item">
                      <Calendar size={16} />
                      <span>{group.studyDay}</span>
                    </div>
                    <div className="detail-item">
                      <Clock size={16} />
                      <span>{group.studyTime}</span>
                    </div>
                    <div className="detail-item">
                      <MapPin size={16} />
                      <span>{group.location || "UiTM Shah Alam"}</span>
                    </div>
                    <div className="detail-item match-score">
                      <Star size={16} />
                      <span>
                        {typeof group.compatibilityScore === 'number'
                          ? `${group.compatibilityScore.toFixed(0)}%`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="detail-item membership-status">
                      <Users size={16} />
                      <span>
                        {currentMemberCount}/{group.groupSize || "∞"} members
                      </span>
                    </div>
                  </div>

                  <div className="group-actions">
                    <button
                      className={`join-btn ${alreadyInGroup || isFull ? "joined" : ""}`}
                      disabled={alreadyInGroup || isFull}
                      onClick={() => !alreadyInGroup && !isFull && handleJoin(group.id)}
                      aria-label={`${alreadyInGroup ? "Already joined" : isFull ? "Group is full" : "Join"} ${group.groupName}`}
                    >
                      {alreadyInGroup ? "✓ Joined" : isFull ? "Full" : "Join"}
                    </button>
                  </div>
                </div>
              );
            })}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </Layout>
  );
}
