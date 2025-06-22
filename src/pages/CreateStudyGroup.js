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
      <div className="profile-header">
        <h2 className="page-title">Manage Study Group</h2>
        <p className="page-subtitle">Create or edit your study groups with enhanced details</p>
      </div>

      <div className="form-arrow-container">
        <div className="enhanced-card">
          {viewMode === "form" ? (
            <form className="enhanced-form" onSubmit={handleSubmit}>
              {/* form fields as before */}
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Group Name<span className="required">*</span></label>
                  <input className="form-input" type="text" required value={formData.groupName} onChange={(e) => setFormData({ ...formData, groupName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Study Subject<span className="required">*</span></label>
                  <input className="form-input" type="text" required value={formData.studySubject} onChange={(e) => setFormData({ ...formData, studySubject: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Group Type<span className="required">*</span></label>
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

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Study Day<span className="required">*</span></label>
                  <select className="form-select" required value={formData.studyDay} onChange={(e) => setFormData({ ...formData, studyDay: e.target.value })}>
                    <option value="">Select Day</option>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Study Time<span className="required">*</span></label>
                  <input className="form-input" type="time" required value={formData.studyTime} onChange={(e) => setFormData({ ...formData, studyTime: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Group Size<span className="required">*</span></label>
                  <input className="form-input" type="number" min="2" max="50" required value={formData.groupSize} onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Invite Users <small className="label-helper">Add email addresses</small></label>
                <div className="invite-list">
                  {formData.inviteList.map((email, idx) => (
                    <div className="invite-input-group" key={idx}>
                      <input className="form-input invite-input" type="email" value={email} onChange={(e) => {
                        const updated = [...formData.inviteList];
                        updated[idx] = e.target.value;
                        setFormData({ ...formData, inviteList: updated });
                      }} />
                      <button type="button" className="btn-remove" onClick={() => {
                        const updated = formData.inviteList.filter((_, i) => i !== idx);
                        setFormData({ ...formData, inviteList: updated });
                      }}>×</button>
                    </div>
                  ))}
                  <button type="button" className="btn-add-invite" onClick={() => setFormData({ ...formData, inviteList: [...formData.inviteList, ""] })}>
                    + Add Email Address
                  </button>
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-delete" disabled={!selectedGroupId} onClick={handleDelete}>Delete Group</button>
                <button type="button" className="btn-cancel" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn-primary">{selectedGroupId ? "Update Group" : "Create Group"}</button>
              </div>
            </form>
          ) : (
            <div>
              <h3>Your Created Groups</h3>
              <ul className="group-list">
                {groups.length === 0 ? (
                  <p>No groups found.</p>
                ) : (
                  groups.map((group) => (
                    <li
                      key={group.id}
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
                      className="group-item"
                    >
                      <strong>{group.groupName}</strong> — {group.studySubject} on {group.studyDay} at {group.studyTime}<br />
                      Group Size: {group.groupSize}<br />
                      Invited: {group.inviteList?.join(", ") || "None"}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <div className="arrow-side">
          <button className="enhanced-arrow" title="Switch View" onClick={() => setViewMode(viewMode === "form" ? "list" : "form")}>
            {viewMode === "form" ? "→" : "←"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
