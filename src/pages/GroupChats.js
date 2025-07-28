import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import { db, auth } from "../pages/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import Layout from "../components/layout";
import "../pages/GroupChats.css";

export default function GroupChat() {
  // ✅ Scoped component state - isolated from other components
  const { groupId } = useParams();
  const [groupChatGroups, setGroupChatGroups] = useState([]);
  const [groupChatMessages, setGroupChatMessages] = useState([]);
  const [groupChatLastMessages, setGroupChatLastMessages] = useState({});
  const [groupChatNewMessage, setGroupChatNewMessage] = useState("");
  const [groupChatMembers, setGroupChatMembers] = useState([]);
  const [groupChatName, setGroupChatName] = useState("");
  const [groupChatLoading, setGroupChatLoading] = useState(true);
  const [groupChatError, setGroupChatError] = useState(null);
  const [groupChatMemberNames, setGroupChatMemberNames] = useState({});
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [scrollPositionMemory, setScrollPositionMemory] = useState({});
  const groupChatUser = auth.currentUser;
  const groupChatMessagesEndRef = useRef(null);
  const groupChatMessagesContainerRef = useRef(null);
  const navigate = useNavigate();

  // ✅ Enhanced auto-scroll effect with scroll-to-bottom functionality
  useEffect(() => {
    const container = groupChatMessagesContainerRef.current;
    if (container && groupChatMessages.length > 0) {
      // Check if user was near bottom before new message
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;

      // Auto-scroll to bottom for new messages if user was already near bottom
      if (isNearBottom) {
        setTimeout(() => {
          groupChatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [groupChatMessages]);

  // ✅ Load more chat history function
  const loadMoreHistory = useCallback(async () => {
    if (isLoadingHistory) return;

    setIsLoadingHistory(true);
    // Simulate loading more messages (implement actual history loading here)
    setTimeout(() => {
      setIsLoadingHistory(false);
    }, 1000);
  }, [isLoadingHistory]);

  // ✅ Enhanced bidirectional scroll position monitoring
  useEffect(() => {
    const container = groupChatMessagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Calculate scroll percentage
      const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
      setScrollPosition(scrollPercentage);

      // Show/hide scroll buttons based on position
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      const isNearTop = scrollTop < 100;

      setShowScrollToBottom(!isNearBottom);
      setShowScrollToTop(!isNearTop);

      // Load more history when scrolling near top
      if (isNearTop && !isLoadingHistory) {
        loadMoreHistory();
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isLoadingHistory, loadMoreHistory]);

  // ✅ Scroll position memory for navigation between chats
  useEffect(() => {
    const currentGroupId = window.location.pathname.split('/').pop();
    if (currentGroupId && scrollPositionMemory[currentGroupId]) {
      const container = groupChatMessagesContainerRef.current;
      if (container) {
        setTimeout(() => {
          container.scrollTop = scrollPositionMemory[currentGroupId];
        }, 100);
      }
    }
  }, [groupId, scrollPositionMemory]);

  // ✅ Save scroll position when leaving chat
  useEffect(() => {
    return () => {
      const container = groupChatMessagesContainerRef.current;
      const currentGroupId = window.location.pathname.split('/').pop();
      if (container && currentGroupId) {
        setScrollPositionMemory(prev => ({
          ...prev,
          [currentGroupId]: container.scrollTop
        }));
      }
    };
  }, [groupId]);

  // ✅ Enhanced scroll functions
  const scrollToBottom = useCallback(() => {
    groupChatMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const scrollToTop = useCallback(() => {
    if (groupChatMessagesContainerRef.current) {
      groupChatMessagesContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, []);

  // ✅ Scoped groups fetching effect - isolated state management
  useEffect(() => {
    if (!groupChatUser?.email) return;
    const unsubscribe = onSnapshot(collection(db, "studyGroups"), async (snapshot) => {
      const groupList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const group = { id: docSnap.id, ...docSnap.data() };
          if (group.creatorEmail === groupChatUser.email || (group.joinedList || []).includes(groupChatUser.email)) {
            const msgQuery = query(
              collection(db, `chats/${docSnap.id}/messages`),
              orderBy("timestamp", "desc")
            );
            const lastMsgSnap = await getDocs(msgQuery);
            const lastMsg = lastMsgSnap.docs[0]?.data();
            setGroupChatLastMessages((prev) => ({ ...prev, [docSnap.id]: lastMsg }));
            return group;
          }
          return null;
        })
      );
      setGroupChatGroups(groupList.filter(Boolean));
    });
    return () => unsubscribe();
  }, [groupChatUser?.email]);

  // ✅ Scoped member names fetching effect - isolated data management
  useEffect(() => {
    const fetchGroupChatNames = async () => {
      const names = {};
      for (const email of groupChatMembers) {
        const snap = await getDocs(query(collection(db, "profiles")));
        snap.forEach((doc) => {
          const profile = doc.data();
          if (profile.email === email) {
            names[email] = profile.name || email;
          }
        });
      }
      setGroupChatMemberNames(names);
    };
    if (groupChatMembers.length) fetchGroupChatNames();
  }, [groupChatMembers]);

  // ✅ Scoped group details fetching effect - isolated component logic
  useEffect(() => {
    if (!groupId) return;
    const fetchGroupChatDetails = async () => {
      try {
        const groupDoc = await getDoc(doc(db, "studyGroups", groupId));
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          setGroupChatName(data.groupName || `Group ${groupId}`);
          const allMembers = [...(data.joinedList || []), data.creatorEmail];
          setGroupChatMembers([...new Set(allMembers)]);
        }
      } catch (err) {
        setGroupChatError("Failed to load group details");
      }
    };
    fetchGroupChatDetails();
  }, [groupId]);

  // ✅ Scoped messages fetching effect - isolated real-time updates
  useEffect(() => {
    if (!groupId) return;
    const q = query(collection(db, `chats/${groupId}/messages`), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            isOwn: doc.data().sender === groupChatUser?.email,
          }));
          setGroupChatMessages(data);
          setGroupChatLoading(false);
        } catch (err) {
          setGroupChatError("Failed to load messages");
        }
      },
      () => setGroupChatError("Failed to connect to chat")
    );
    return () => unsubscribe();
  }, [groupId, groupChatUser?.email]);

  // ✅ Scoped message sending function - isolated component logic
  const sendGroupChatMessage = useCallback(async () => {
    if (!groupChatNewMessage.trim() || !groupChatUser?.email) return;
    const chatDocRef = doc(db, "chats", groupId);
    try {
      const chatExists = await getDoc(chatDocRef);
      if (!chatExists.exists()) {
        await setDoc(chatDocRef, {
          createdAt: serverTimestamp(),
          createdBy: groupChatUser.email,
        });
      }
      await addDoc(collection(db, `chats/${groupId}/messages`), {
        sender: groupChatUser.email,
        senderName: groupChatUser.displayName || groupChatUser.email,
        text: groupChatNewMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setGroupChatNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setGroupChatError("Failed to send message.");
    }
  }, [groupChatNewMessage, groupChatUser, groupId]);

  // ✅ Scoped keyboard event handler - isolated component behavior
  const handleGroupChatKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendGroupChatMessage();
    }
  }, [sendGroupChatMessage]);

  // ✅ Scoped utility functions - isolated component helpers
  const formatGroupChatTimestamp = useCallback((timestamp) => {
    if (!timestamp) return "";

    let date;
    if (timestamp.toDate) {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      // Firestore Timestamp object
      date = new Date(timestamp.seconds * 1000);
    } else if (typeof timestamp === 'string') {
      // ISO string
      date = new Date(timestamp);
    } else {
      // Regular Date object
      date = new Date(timestamp);
    }

    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24 && now.toDateString() === date.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 168) { // Less than a week
      return date.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }
  }, []);

  const getGroupChatInitials = useCallback((name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, []);

  const getGroupChatMemberNames = useCallback(() => {
    return groupChatMembers.map((email) => groupChatMemberNames[email] || email).join(", ");
  }, [groupChatMembers, groupChatMemberNames]);

  // ✅ Get display name for message sender
  const getMessageSenderName = useCallback((message) => {
    if (!message) return "Unknown";

    // Priority: senderName > displayName from profiles > email
    if (message.senderName && message.senderName !== message.sender) {
      return message.senderName;
    }

    if (groupChatMemberNames[message.sender]) {
      return groupChatMemberNames[message.sender];
    }

    return message.sender || "Unknown";
  }, [groupChatMemberNames]);

  return (
    <Layout>
      <div className="group-chats-page">
        <div className="group-chats-app-layout">
          <div className="group-chats-sidebar">
            <div className="group-chats-sidebar-header">
              <span className="group-chats-header-title">Groups</span>
            </div>
            <div className="group-chats-groups-list">
              {groupChatGroups.map((g) => (
                <NavLink
                  key={g.id}
                  to={`/group-chat/${g.id}`}
                  className={`group-chats-group-item ${groupId === g.id ? "group-chats-active" : ""}`}
                >
                  <div className="group-chats-group-initials">{getGroupChatInitials(g.groupName)}</div>
                  <div className="group-chats-group-info">
                    <div className="group-chats-group-name">{g.groupName}</div>
                    <div className="group-chats-group-last-message">
                      {groupChatLastMessages[g.id]?.text || "No messages yet"}
                    </div>
                  </div>
                </NavLink>
              ))}
            </div>
          </div>

          <div className="group-chats-chat-container">
            <div className="group-chats-chat-header">
              <div className="group-chats-group-avatar">
                <span>{getGroupChatInitials(groupChatName)}</span>
              </div>
              <div className="group-chats-group-info">
                <h2 className="group-chats-group-title">{groupChatName}</h2>
                <p className="group-chats-members-list">
                  {groupChatMembers.length ? getGroupChatMemberNames() : "No members"}
                </p>
              </div>
              <div className="group-chats-member-count">
                {groupChatMembers.length} member{groupChatMembers.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div
              className="group-chats-messages-container"
              ref={groupChatMessagesContainerRef}
            >
              {/* Loading History Indicator */}
              {isLoadingHistory && (
                <div className="history-loading-indicator">
                  <div className="history-loading-spinner" />
                  <span>Loading older messages...</span>
                </div>
              )}

              {groupChatLoading ? (
                <div className="group-chats-chat-loading">
                  <div className="group-chats-loading-spinner" />
                  <p>Loading chat...</p>
                </div>
              ) : groupChatError ? (
                <div className="group-chats-chat-error">
                  <p>{groupChatError}</p>
                  <button onClick={() => window.location.reload()}>Retry</button>
                </div>
              ) : groupChatMessages.length === 0 ? (
                <div className="group-chats-welcome-message">
                  <p>Welcome to {groupChatName}!</p>
                  <p>Start the conversation by sending a message below.</p>
                </div>
              ) : (
                groupChatMessages.map((msg) => {
                  const senderDisplayName = getMessageSenderName(msg);
                  return (
                    <div key={msg.id} className={`group-chats-message-wrapper ${msg.isOwn ? "group-chats-own" : "group-chats-other"}`}>
                      <div className="group-chats-message-content">
                        {!msg.isOwn && (
                          <div className="group-chats-sender-avatar">
                            <span>{getGroupChatInitials(senderDisplayName)}</span>
                          </div>
                        )}
                        <div className={`group-chats-message-bubble ${msg.isOwn ? "group-chats-own" : "group-chats-other"}`}>
                          {!msg.isOwn && (
                            <div className="group-chats-sender-name">{senderDisplayName}</div>
                          )}
                          <div className="group-chats-message-text">{msg.text}</div>
                          <div className="group-chats-message-time">{formatGroupChatTimestamp(msg.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={groupChatMessagesEndRef} />

              {/* Enhanced Bidirectional Scroll Controls */}
              <div className="scroll-controls-container">
                {/* Scroll to Top Button */}
                <button
                  className={`scroll-control-btn scroll-to-top-btn ${showScrollToTop ? 'visible' : ''}`}
                  onClick={scrollToTop}
                  aria-label="Scroll to top of chat"
                  title="Scroll to older messages"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M16.59 15.41L12 10.83l-4.59 4.58L6 14l6-6 6 6-1.41 1.41z"/>
                  </svg>
                </button>

                {/* Scroll Progress Indicator */}
                {(showScrollToTop || showScrollToBottom) && (
                  <div className="scroll-progress-indicator">
                    <div className="scroll-progress-track">
                      <div
                        className="scroll-progress-thumb"
                        style={{ top: `${scrollPosition}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Scroll to Bottom Button */}
                <button
                  className={`scroll-control-btn scroll-to-bottom-btn ${showScrollToBottom ? 'visible' : ''}`}
                  onClick={scrollToBottom}
                  aria-label="Scroll to bottom of chat"
                  title="Scroll to latest messages"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="group-chats-input-container">
              <div className="group-chats-input-wrapper">
                <textarea
                  value={groupChatNewMessage}
                  onChange={(e) => setGroupChatNewMessage(e.target.value)}
                  onKeyDown={handleGroupChatKeyPress}
                  placeholder="Type a message..."
                  rows="1"
                  className="group-chats-message-input"
                />
                <button
                  onClick={sendGroupChatMessage}
                  disabled={!groupChatNewMessage.trim()}
                  className="group-chats-send-button"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="white" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
