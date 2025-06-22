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

  const addScheduleField = () =>
    setFormData({
      ...formData,
      studySchedule: [...formData.studySchedule, { day: "", time: "" }],
    });

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
      <div className="profile-container">
        <div className="profile-header">
          <h2>Edit Profile</h2>
        </div>
        <div className="profile-card">
          <form className="profile-form" onSubmit={handleSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Phone no</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10,15}"
                placeholder="e.g. 0123456789"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Study Subjects</label>
              {formData.studySubjects.map((subject, index) => (
                <input
                  key={index}
                  type="text"
                  value={subject}
                  onChange={(e) => handleSubjectChange(index, e.target.value)}
                  placeholder={`Subject #${index + 1}`}
                />
              ))}
              <button type="button" onClick={addSubjectField}>
                + Add Subject
              </button>
            </div>

            <div className="form-group">
              <label>Study Schedule</label>
              {formData.studySchedule.map((entry, index) => (
                <div key={index} style={{ display: "flex", gap: "10px" }}>
                  <select
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
                    type="time"
                    value={entry.time}
                    onChange={(e) =>
                      handleScheduleChange(index, "time", e.target.value)
                    }
                  />
                </div>
              ))}
              <button type="button" onClick={addScheduleField}>
                + Add Study Time
              </button>
            </div>

            <div className="form-buttons">
              <button type="submit" className="btn-save">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
