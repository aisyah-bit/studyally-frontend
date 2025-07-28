import React, { useState, useEffect } from "react";
import Layout from "../components/layout";
import "./Profile.css";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function ManageProfile() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    location: "",
    studySubjects: [""],
    studySchedule: [{ day: "", time: "" }],
  });
 // const [loading, setLoading] = useState(true);

  // ✅ Load profile based on actual logged-in UID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const ref = doc(db, "profiles", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setFormData({
            fullName: snap.data().fullName || "",
            phone: snap.data().phone || "",
            location: snap.data().location || "",
            studySubjects: snap.data().studySubjects || [""],
            studySchedule: snap.data().studySchedule || [{ day: "", time: "" }],
          });
        }
       // setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (index, value) => {
    const updated = [...formData.studySubjects];
    updated[index] = value;
    setFormData({ ...formData, studySubjects: updated });
  };

  const handleScheduleChange = (index, field, value) => {
    const updated = [...formData.studySchedule];
    updated[index][field] = value;
    setFormData({ ...formData, studySchedule: updated });
  };

  const addSubjectField = () =>
    setFormData({
      ...formData,
      studySubjects: [...formData.studySubjects, ""],
    });

  const removeSubjectField = (index) => {
    if (formData.studySubjects.length > 1) {
      const updated = formData.studySubjects.filter((_, i) => i !== index);
      setFormData({ ...formData, studySubjects: updated });
    }
  };

  const addScheduleField = () =>
    setFormData({
      ...formData,
      studySchedule: [...formData.studySchedule, { day: "", time: "" }],
    });

  const removeScheduleField = (index) => {
    if (formData.studySchedule.length > 1) {
      const updated = formData.studySchedule.filter((_, i) => i !== index);
      setFormData({ ...formData, studySchedule: updated });
    }
  };

  // ✅ Save/update the current user's profile
  const handleSave = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("Not logged in");

    try {
      const ref = doc(db, "profiles", user.uid);
      await setDoc(ref, {
        ...formData,
        email: user.email,
        createdAt: new Date(),
      });
      alert("Profile saved!");
    } catch (err) {
      console.error("Error:", err);
      alert("Failed to save: " + err.message);
    }
  };

  //if (loading) return <p>Loading profile...</p>;

  return (
    <Layout username={formData.fullName || "User"}>
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-header">
              <h2 className="profile-title">Edit Profile</h2>
              <p className="profile-subtitle">Update your personal information and study preferences</p>
            </div>

            <div className="profile-content">
              <form
                className="profile-form"
                onSubmit={handleSave}
                tabIndex="0"
                aria-label="Profile form with smooth scrolling - use arrow keys to navigate"
                role="region"
                aria-describedby="profile-form-description"
              >
                <div id="profile-form-description" className="sr-only">
                  This form allows you to edit your profile information. The form supports smooth scrolling and keyboard navigation.
                </div>
                {/* Basic Information Section */}
                <div className="form-section">
                  <h3 className="section-title">Basic Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="required">*</span></label>
                      <input
                        className="form-input"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone Number <span className="required">*</span></label>
                      <input
                        className="form-input"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        pattern="[0-9]{10,15}"
                        placeholder="e.g. 0123456789"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Location</label>
                    <input
                      className="form-input"
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter your location"
                    />
                  </div>
                </div>

                {/* Study Subjects Section */}
                <div className="form-section">
                  <h3 className="section-title">Study Subjects</h3>
                  <div
                    className="dynamic-list"
                    tabIndex="0"
                    aria-label="Study subjects list with smooth scrolling"
                    role="region"
                  >
                    {formData.studySubjects.map((subject, index) => (
                      <div key={index} className="dynamic-item">
                        <input
                          className="form-input"
                          type="text"
                          value={subject}
                          onChange={(e) => handleSubjectChange(index, e.target.value)}
                          placeholder={`Subject #${index + 1}`}
                        />
                        {formData.studySubjects.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeSubjectField(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn-add" onClick={addSubjectField}>
                      + Add Subject
                    </button>
                  </div>
                </div>

                {/* Study Schedule Section */}
                <div className="form-section">
                  <h3 className="section-title">Study Schedule</h3>
                  <div
                    className="dynamic-list"
                    tabIndex="0"
                    aria-label="Study schedule list with smooth scrolling"
                    role="region"
                  >
                    {formData.studySchedule.map((entry, index) => (
                      <div key={index} className="dynamic-item schedule-item">
                        <select
                          className="form-select"
                          value={entry.day}
                          onChange={(e) =>
                            handleScheduleChange(index, "day", e.target.value)
                          }
                        >
                          <option value="">Select Day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                        <input
                          className="form-input"
                          type="time"
                          value={entry.time}
                          onChange={(e) =>
                            handleScheduleChange(index, "time", e.target.value)
                          }
                        />
                        {formData.studySchedule.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeScheduleField(index)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" className="btn-add" onClick={addScheduleField}>
                      + Add Study Time
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="form-buttons">
                  <button type="submit" className="btn-primary">
                    Save Profile
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
