import React, { useEffect, useRef, useState } from "react";
import { useParams, NavLink } from "react-router-dom";
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
import "../pages/GroupChats.css";

export default function GroupChat() {
  const { groupId } = useParams();
  const [groups, setGroups] = useState([]);
  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [groupMembers, setGroupMembers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberNames, setMemberNames] = useState({});
  const user = auth.currentUser;
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = onSnapshot(collection(db, "studyGroups"), async (snapshot) => {
      const groupList = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const group = { id: docSnap.id, ...docSnap.data() };
          if (group.creatorEmail === user.email || (group.joinedList || []).includes(user.email)) {
            const msgQuery = query(
              collection(db, `chats/${docSnap.id}/messages`),
              orderBy("timestamp", "desc")
            );
            const lastMsgSnap = await getDocs(msgQuery);
            const lastMsg = lastMsgSnap.docs[0]?.data();
            setLastMessages((prev) => ({ ...prev, [docSnap.id]: lastMsg }));
            return group;
          }
          return null;
        })
      );
      setGroups(groupList.filter(Boolean));
    });
    return () => unsubscribe();
  }, [user?.email]);

  useEffect(() => {
    const fetchNames = async () => {
      const names = {};
      for (const email of groupMembers) {
        const snap = await getDocs(query(collection(db, "profiles")));
        snap.forEach((doc) => {
          const profile = doc.data();
          if (profile.email === email) {
            names[email] = profile.name || email;
          }
        });
      }
      setMemberNames(names);
    };
    if (groupMembers.length) fetchNames();
  }, [groupMembers]);

  useEffect(() => {
    if (!groupId) return;
    const fetchGroupDetails = async () => {
      try {
        const groupDoc = await getDoc(doc(db, "studyGroups", groupId));
        if (groupDoc.exists()) {
          const data = groupDoc.data();
          setGroupName(data.groupName || `Group ${groupId}`);
          const allMembers = [...(data.joinedList || []), data.creatorEmail];
          setGroupMembers([...new Set(allMembers)]);
        }
      } catch (err) {
        setError("Failed to load group details");
      }
    };
    fetchGroupDetails();
  }, [groupId]);

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
            isOwn: doc.data().sender === user?.email,
          }));
          setMessages(data);
          setLoading(false);
        } catch (err) {
          setError("Failed to load messages");
        }
      },
      () => setError("Failed to connect to chat")
    );
    return () => unsubscribe();
  }, [groupId, user?.email]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.email) return;
    const chatDocRef = doc(db, "chats", groupId);
    try {
      const chatExists = await getDoc(chatDocRef);
      if (!chatExists.exists()) {
        await setDoc(chatDocRef, {
          createdAt: serverTimestamp(),
          createdBy: user.email,
        });
      }
      await addDoc(collection(db, `chats/${groupId}/messages`), {
        sender: user.email,
        senderName: user.displayName || user.email,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message.");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    return now.toDateString() === date.toDateString()
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getMemberNames = () => {
    return groupMembers.map((email) => memberNames[email] || email).join(", ");
  };

  return (
    <div className="group-chat-page">
      <div className="app-layout">
        <div className="sidebar">
          <div className="sidebar-header">Groups</div>
          <div style={{ overflowY: "auto", flexGrow: 1 }}>
            {groups.map((g) => (
              <NavLink
                key={g.id}
                to={`/group-chat/${g.id}`}
                className={`group-item ${groupId === g.id ? "active" : ""}`}
              >
                <div className="group-initials">{getInitials(g.groupName)}</div>
                <div className="group-info">
                  <div className="group-name">{g.groupName}</div>
                  <div className="group-last-message">
                    {lastMessages[g.id]?.text || "No messages yet"}
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        <div className="chat-container">
          <div className="chat-header">
            <div className="group-avatar">
              <span>{getInitials(groupName)}</span>
            </div>
            <div className="group-info">
              <h2>{groupName}</h2>
              <p className="members-list">
                {groupMembers.length ? getMemberNames() : "No members"}
              </p>
            </div>
            <div className="member-count">
              {groupMembers.length} member{groupMembers.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div className="messages-container">
            {loading ? (
              <div className="chat-loading">
                <div className="loading-spinner" />
                <p>Loading chat...</p>
              </div>
            ) : error ? (
              <div className="chat-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>Retry</button>
              </div>
            ) : messages.length === 0 ? (
              <div className="welcome-message">
                <p>👋 Welcome to {groupName}!</p>
                <p>Start the conversation by sending a message below.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message-wrapper ${msg.isOwn ? "own" : "other"}`}>
                  <div className="message-content">
                    {!msg.isOwn && (
                      <div className="sender-avatar">
                        <span>{getInitials(memberNames[msg.senderName] || msg.senderName)}</span>
                      </div>
                    )}
                    <div className={`message-bubble ${msg.isOwn ? "own" : "other"}`}>
                      {!msg.isOwn && (
                        <div className="sender-name">{memberNames[msg.senderName] || msg.senderName}</div>
                      )}
                      <div className="message-text">{msg.text}</div>
                      <div className="message-time">{formatTimestamp(msg.timestamp)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="input-container">
            <div className="input-wrapper">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows="1"
                className="message-input"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                className="send-button"
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
  );
}
