import React, { useState, useEffect } from "react";
import Layout from "../components/layout";
import "./CreateStudyGroup.css";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "./firebaseConfig";

export default function ManageProfile() {
  const [viewMode, setViewMode] = useState("form");
  const [formData, setFormData] = useState({
    groupName: "",
    studySubject: "",
    studyDay: "",
    studyTime: "",
    groupSize: "",
    inviteList: [],
    groupType: "general",
  });
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) fetchGroups(user);
    });
    return () => unsubscribe();
  }, []);

  const fetchGroups = async (user) => {
    const querySnapshot = await getDocs(collection(db, "studyGroups"));
    const filtered = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((g) => g.creatorId === user.uid);
    setGroups(filtered);
  };

  const resetForm = () => {
    setFormData({
      groupName: "",
      studySubject: "",
      studyDay: "",
      studyTime: "",
      groupSize: "",
      inviteList: [],
      groupType: "general",
    });
    setSelectedGroupId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");

    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);
    const location = profileSnap.exists() ? profileSnap.data().location || "Unknown" : "Unknown";

    const data = {
      ...formData,
      createdAt: new Date(),
      creatorId: user.uid,
      creatorEmail: user.email,
      location,
    };

    try {
      if (selectedGroupId) {
        await updateDoc(doc(db, "studyGroups", selectedGroupId), data);
        alert("Group updated.");
      } else {
        await addDoc(collection(db, "studyGroups"), data);
        alert("Group created.");
      }
      resetForm();
      fetchGroups(user);
    } catch (err) {
      console.error(err);
      alert("Operation failed.");
    }
  };

  const handleDelete = async () => {
    if (!selectedGroupId) return;
    try {
      await deleteDoc(doc(db, "studyGroups", selectedGroupId));
      alert("Group deleted.");
      resetForm();
      fetchGroups(auth.currentUser);
    } catch (err) {
      console.error(err);
      alert("Delete failed.");
    }
  };

  return (
    <Layout>
      <div className="create-study-group-page">
        <div className="form-container">
          <div className="form-card">
            {viewMode === "form" ? (
              <form className="study-group-form" onSubmit={handleSubmit}>
                {/* Purple Header Section */}
                <div className="form-header">
                  <h2 className="form-title">Manage Study Group</h2>
                  <p className="form-subtitle">Create or edit your study groups with enhanced details</p>
                </div>

                {/* Enhanced Form Content with Optimized Layout */}
                <div
                  className="form-content"
                  tabIndex="0"
                  aria-label="Study group form content with smooth scrolling"
                  role="region"
                  aria-describedby="form-content-description"
                >
                  <div id="form-content-description" className="sr-only">
                    Form content area with smooth scrolling support. Use arrow keys to navigate through sections.
                  </div>
                  {/* Basic Information Section */}
                  <div className="basic-info-section">
                    <div className="form-group">
                      <label className="form-label">Group Name <span className="required">*</span></label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Enter a descriptive group name..."
                        required
                        value={formData.groupName}
                        onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Study Subject <span className="required">*</span></label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="e.g., Mathematics, Computer Science..."
                        required
                        value={formData.studySubject}
                        onChange={(e) => setFormData({ ...formData, studySubject: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Group Type Selection */}
                  <div className="group-type-section">
                    <div className="form-group">
                      <label className="form-label">Group Type <span className="required">*</span></label>
                      <div className="radio-group">
                        {['general', 'assignment'].map((type) => (
                          <label className="radio-option" key={type}>
                            <input type="radio" name="groupType" checked={formData.groupType === type} onChange={() => setFormData({ ...formData, groupType: type })} />
                            <span className="radio-checkmark"></span>
                            <span className="radio-label">
                              <strong>{type === 'general' ? 'General Study Group' : 'Assignment Group'}</strong>
                              <small>{type === 'general' ? 'Regular study sessions and knowledge sharing' : 'Focused on assignments and projects'}</small>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Schedule Section */}
                  <div className="schedule-section">
                    <div className="form-group">
                      <label className="form-label">Study Day <span className="required">*</span></label>
                      <select className="form-select" required value={formData.studyDay} onChange={(e) => setFormData({ ...formData, studyDay: e.target.value })}>
                        <option value="">Select Day</option>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                          <option key={day} value={day}>{day}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Study Time <span className="required">*</span></label>
                      <input className="form-input" type="time" required value={formData.studyTime} onChange={(e) => setFormData({ ...formData, studyTime: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Group Size <span className="required">*</span></label>
                      <input
                        className="form-input"
                        type="number"
                        min="2"
                        max="50"
                        placeholder="2-50 members"
                        required
                        value={formData.groupSize}
                        onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Invite Users Section */}
                  <div className="invite-section">
                    <div className="form-group">
                      <label className="form-label">Invite Users <small className="label-helper">Add email addresses to invite members</small></label>
                      <div
                        className="invite-list"
                        tabIndex="0"
                        aria-label="Email invitation list with smooth scrolling"
                        role="region"
                        aria-describedby="invite-list-description"
                      >
                        <div id="invite-list-description" className="sr-only">
                          List of email addresses to invite to the study group. Supports smooth scrolling for long lists.
                        </div>
                        {formData.inviteList.map((email, idx) => (
                          <div className="invite-input-group" key={idx}>
                            <input
                              className="form-input invite-input"
                              type="email"
                              placeholder="Enter email address..."
                              value={email}
                              onChange={(e) => {
                                const updated = [...formData.inviteList];
                                updated[idx] = e.target.value;
                                setFormData({ ...formData, inviteList: updated });
                              }}
                            />
                            <button type="button" className="btn-remove" onClick={() => {
                              const updated = formData.inviteList.filter((_, i) => i !== idx);
                              setFormData({ ...formData, inviteList: updated });
                            }}>×</button>
                          </div>
                        ))}
                        <button type="button" className="btn-add-invite" onClick={() => setFormData({ ...formData, inviteList: [...formData.inviteList, ""] })}>
                          Add Email Address
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Action Buttons */}
                <div className="form-buttons">
                  <button type="button" className="btn-delete" disabled={!selectedGroupId} onClick={handleDelete}>Delete Group</button>
                  <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                  <button type="submit" className="btn-primary">{selectedGroupId ? "Update Group" : "Create Group"}</button>
                </div>
              </form>
            ) : (
              <div className="group-list-view">
                <div className="form-header">
                  <h2 className="form-title">Your Created Groups</h2>
                  <p className="form-subtitle">Manage and organize your study groups with enhanced details</p>
                </div>
                <div
                  className="enhanced-group-list-content"
                  tabIndex="0"
                  aria-label="Study groups list with smooth scrolling"
                  role="region"
                  aria-describedby="group-list-description"
                >
                  <div id="group-list-description" className="sr-only">
                    List of your created study groups with smooth scrolling support. Use arrow keys to navigate.
                  </div>
                  {groups.length === 0 ? (
                    <div className="no-groups-container">
                      <div className="no-groups-icon">📚</div>
                      <h3 className="no-groups-title">No Study Groups Yet</h3>
                      <p className="no-groups-message">Create your first study group to get started with collaborative learning!</p>
                      <button
                        className="create-first-group-btn"
                        onClick={() => setViewMode("form")}
                        aria-label="Create your first study group"
                      >
                        Create Your First Group
                      </button>
                    </div>
                  ) : (
                    <div className="enhanced-group-grid">
                      {groups.map((group) => (
                        <div key={group.id} className="enhanced-group-card">
                          <div className="group-card-header">
                            <div className="group-type-indicator" data-type={group.groupType || 'general'}>
                              {group.groupType === 'assignment' ? '📝' : '📚'}
                            </div>
                            <div className="group-status-badge">Active</div>
                          </div>

                          <div className="group-card-content">
                            <h3 className="group-card-title">{group.groupName}</h3>
                            <p className="group-card-subject">{group.studySubject}</p>

                            <div className="group-card-details">
                              <div className="detail-row">
                                <span className="detail-icon">📅</span>
                                <span className="detail-text">{group.studyDay} at {group.studyTime}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-icon">👥</span>
                                <span className="detail-text">{group.groupSize} members max</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-icon">📧</span>
                                <span className="detail-text">{group.inviteList?.length || 0} invited</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-icon">🗓️</span>
                                <span className="detail-text">
                                  Created: {group.createdAt ? new Date(group.createdAt.seconds * 1000).toLocaleDateString() : 'Recently'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="group-card-actions">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => {
                                setSelectedGroupId(group.id);
                                setFormData({
                                  groupName: group.groupName,
                                  studySubject: group.studySubject,
                                  studyDay: group.studyDay,
                                  studyTime: group.studyTime,
                                  groupSize: group.groupSize,
                                  inviteList: group.inviteList || [],
                                  groupType: group.groupType || "general",
                                });
                                setViewMode("form");
                              }}
                              aria-label={`Edit ${group.groupName}`}
                              title="Edit this group"
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="action-btn view-btn"
                              onClick={() => {
                                // Navigate to group chat or details view
                                window.location.href = `/group-chat/${group.id}`;
                              }}
                              aria-label={`View ${group.groupName}`}
                              title="View group chat"
                            >
                              👁️ View
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete "${group.groupName}"?`)) {
                                  try {
                                    await deleteDoc(doc(db, "studyGroups", group.id));
                                    setGroups(groups.filter(g => g.id !== group.id));
                                  } catch (error) {
                                    console.error("Error deleting group:", error);
                                    alert("Failed to delete group. Please try again.");
                                  }
                                }
                              }}
                              aria-label={`Delete ${group.groupName}`}
                              title="Delete this group"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="view-toggle">
            <button className="toggle-button" title="Switch View" onClick={() => setViewMode(viewMode === "form" ? "list" : "form")}>
              {viewMode === "form" ? "→" : "←"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
