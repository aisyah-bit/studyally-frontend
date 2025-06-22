// src/components/GroupList.js
import React, { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../pages/firebaseConfig";
import { NavLink } from "react-router-dom";
import "../pages/GroupChats.css";

export default function GroupList() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "studyGroups"), (snapshot) => {
      const groupList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGroups(groupList);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="sidebar">
      <div className="sidebar-header">Groups</div>
      {groups.map((group) => (
        <NavLink
          key={group.id}
          to={`/group-chat/${group.id}`}
          className="group-item"
        >
          <div className="group-initials">
            {group.groupName?.slice(0, 2).toUpperCase() || "?"}
          </div>
          <div className="group-info">
            <div className="group-name">{group.groupName || "Unnamed"}</div>
            <div className="group-last-message">Last message preview...</div>
          </div>
        </NavLink>
      ))}
    </div>
  );
}
