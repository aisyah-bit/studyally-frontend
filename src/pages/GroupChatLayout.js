import React from "react";
import GroupList from "../components/GroupList";
import GroupChat from "./GroupChats";
import "./GroupChats.css";

export default function GroupChatLayout() {
  return (
    <div className="app-layout" style={{ display: "flex", height: "100vh" }}>
      <GroupList />
      <GroupChat />
    </div>
  );
}