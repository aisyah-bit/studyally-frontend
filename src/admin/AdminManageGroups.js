import React, { useEffect, useState, useRef } from 'react';
import { db } from '../pages/firebaseConfig';
import { collection, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import AdminLayout from './AdminLayout';
import { formatDate, sortByCreatedAt } from './utils/dateUtils';
import {
  Edit3,
  Trash2,
  Users,
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  X,
  Save,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import './AdminManageGroups.css';

export default function AdminManageGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [editingGroup, setEditingGroup] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showScrollIndicators, setShowScrollIndicators] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const groupsContainerRef = useRef(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'studyGroups'));
      const groupData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort groups by creation date (newest first)
      const sortedGroups = sortByCreatedAt(groupData, 'desc');
      setGroups(sortedGroups);
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'studyGroups', id));
      setGroups(groups.filter(group => group.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete group. Please try again.");
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
  };

  const handleSaveEdit = async (updatedGroup) => {
    try {
      const groupRef = doc(db, 'studyGroups', updatedGroup.id);
      await updateDoc(groupRef, {
        groupName: updatedGroup.groupName,
        studySubject: updatedGroup.studySubject,
        groupSize: updatedGroup.groupSize,
        location: updatedGroup.location,
        studyDay: updatedGroup.studyDay,
        studyTime: updatedGroup.studyTime
      });

      setGroups(groups.map(group =>
        group.id === updatedGroup.id ? { ...group, ...updatedGroup } : group
      ));
      setEditingGroup(null);
    } catch (error) {
      console.error("Error updating group:", error);
      alert("Failed to update group. Please try again.");
    }
  };

  // Scroll functionality
  const checkScrollPosition = () => {
    if (groupsContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = groupsContainerRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
      setShowScrollIndicators(scrollHeight > clientHeight);
    }
  };

  const scrollToTop = () => {
    if (groupsContainerRef.current) {
      groupsContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const scrollToBottom = () => {
    if (groupsContainerRef.current) {
      groupsContainerRef.current.scrollTo({
        top: groupsContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    checkScrollPosition();
  };

  // Filter groups based on search, type, and date
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.groupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.studySubject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.creatorEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || group.groupType === filterType;

    // Date filtering
    let matchesDate = true;
    if (dateFilter !== "all" && group.createdAt) {
      const groupDate = new Date(group.createdAt);
      const now = new Date();

      switch (dateFilter) {
        case "today":
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          matchesDate = groupDate >= today;
          break;
        case "week":
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          matchesDate = groupDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          matchesDate = groupDate >= monthAgo;
          break;
        case "year":
          const yearAgo = new Date();
          yearAgo.setFullYear(now.getFullYear() - 1);
          matchesDate = groupDate >= yearAgo;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesType && matchesDate;
  });

  useEffect(() => {
    checkScrollPosition();
  }, [groups, filteredGroups]);

  // Use the shared date formatting utility for detailed datetime display
  const formatGroupDateTime = (dateString) => {
    return formatDate(dateString, 'datetime'); // MM/DD/YYYY at HH:MM AM/PM format for manage groups
  };

  // Helper function to calculate total members (creator + joined members)
  const calculateTotalMembers = (group) => {
    const joinedCount = Array.isArray(group.joinedList) ? group.joinedList.length : 0;
    return joinedCount + 1; // +1 for the creator
  };

  return (
    <AdminLayout>
      <div className="admin-manage-groups-page">
        <div className="admin-manage-header">
          <h1>Manage Study Groups</h1>
          <p>View, edit, and manage all study groups in the system</p>
        </div>

        {/* Search and Filter Controls */}
        <div className="admin-controls">
          <div className="admin-search-box">
            <input
              type="text"
              placeholder="Search groups by name, subject, or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-search-input"
            />
          </div>
          <div className="admin-filter-box">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Types</option>
              <option value="general">General Study</option>
              <option value="assignment">Assignment</option>
            </select>
          </div>
          <div className="admin-filter-box">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="year">Past Year</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading groups...</p>
          </div>
        ) : (
          <div className="admin-groups-wrapper">
            <div
              className="admin-groups-container"
              ref={groupsContainerRef}
              onScroll={handleScroll}
            >
              {filteredGroups.length > 0 ? (
                <div className="admin-groups-grid">
                  {filteredGroups.map(group => (
                    <GroupCard
                      key={group.id}
                      group={group}
                      onEdit={handleEdit}
                      onDelete={(id) => setShowDeleteConfirm(id)}
                      formatDate={formatGroupDateTime}
                      calculateTotalMembers={calculateTotalMembers}
                    />
                  ))}
                </div>
              ) : (
                <div className="admin-no-groups">
                  <p>No groups found matching your criteria</p>
                </div>
              )}
            </div>

            {/* Scroll Indicators and Controls */}
            {showScrollIndicators && (
              <div className="admin-scroll-controls">
                <button
                  className={`admin-scroll-btn admin-scroll-up ${!canScrollUp ? 'disabled' : ''}`}
                  onClick={scrollToTop}
                  disabled={!canScrollUp}
                  title="Scroll to top"
                >
                  <ArrowUp size={16} />
                </button>
                <div className="admin-scroll-indicator">
                  <div className={`admin-scroll-dot ${canScrollUp ? 'active' : ''}`}></div>
                  <div className={`admin-scroll-dot ${canScrollDown ? 'active' : ''}`}></div>
                </div>
                <button
                  className={`admin-scroll-btn admin-scroll-down ${!canScrollDown ? 'disabled' : ''}`}
                  onClick={scrollToBottom}
                  disabled={!canScrollDown}
                  title="Scroll to bottom"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        {editingGroup && (
          <EditGroupModal
            group={editingGroup}
            onSave={handleSaveEdit}
            onCancel={() => setEditingGroup(null)}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <DeleteConfirmModal
            groupName={groups.find(g => g.id === showDeleteConfirm)?.groupName}
            onConfirm={() => handleDelete(showDeleteConfirm)}
            onCancel={() => setShowDeleteConfirm(null)}
          />
        )}
      </div>
    </AdminLayout>
  );
}

// GroupCard Component
const GroupCard = ({ group, onEdit, onDelete, formatDate: formatGroupDateTime, calculateTotalMembers }) => {
  const totalMembers = calculateTotalMembers(group);
  const groupSize = parseInt(group.groupSize) || 0;

  return (
    <div className="admin-group-card">
      <div className="admin-group-card-header">
        <h3>{group.groupName}</h3>
        <span className={`admin-group-type ${group.groupType}`}>
          {group.groupType}
        </span>
      </div>

      <div className="admin-group-card-content">
        <div className="admin-group-detail">
          <BookOpen size={16} />
          <span>{group.studySubject}</span>
        </div>
        <div className="admin-group-detail">
          <Users size={16} />
          <span>{totalMembers} / {groupSize} members</span>
        </div>
        <div className="admin-group-detail">
          <Calendar size={16} />
          <span>{group.studyDay}</span>
        </div>
        <div className="admin-group-detail">
          <Clock size={16} />
          <span>{group.studyTime}</span>
        </div>
        <div className="admin-group-detail">
          <MapPin size={16} />
          <span>{group.location || "No location"}</span>
        </div>
      </div>

      <div className="admin-group-card-footer">
        <div className="admin-group-meta">
          <p>Created: {formatGroupDateTime(group.createdAt)}</p>
          <p>Creator: {group.creatorEmail}</p>
          <p className="admin-group-relative-date">
            {formatDate(group.createdAt, 'relative')}
          </p>
        </div>
        <div className="admin-group-actions">
          <button
            className="admin-edit-btn"
            onClick={() => onEdit(group)}
          >
            <Edit3 size={16} />
            Edit
          </button>
          <button
            className="admin-delete-btn"
            onClick={() => onDelete(group.id)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// EditGroupModal Component
const EditGroupModal = ({ group, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    groupName: group.groupName || "",
    studySubject: group.studySubject || "",
    groupSize: group.groupSize || "",
    location: group.location || "",
    studyDay: group.studyDay || "",
    studyTime: group.studyTime || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...group, ...formData });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal">
        <div className="admin-modal-header">
          <h3>Edit Group</h3>
          <button className="admin-modal-close" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-group">
            <label>Group Name</label>
            <input
              type="text"
              value={formData.groupName}
              onChange={(e) => handleChange("groupName", e.target.value)}
              required
            />
          </div>

          <div className="admin-form-group">
            <label>Subject</label>
            <input
              type="text"
              value={formData.studySubject}
              onChange={(e) => handleChange("studySubject", e.target.value)}
              required
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Group Size</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.groupSize}
                onChange={(e) => handleChange("groupSize", e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Study Day</label>
              <select
                value={formData.studyDay}
                onChange={(e) => handleChange("studyDay", e.target.value)}
                required
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
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Study Time</label>
              <input
                type="time"
                value={formData.studyTime}
                onChange={(e) => handleChange("studyTime", e.target.value)}
                required
              />
            </div>

            <div className="admin-form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                placeholder="Study location"
              />
            </div>
          </div>

          <div className="admin-modal-actions">
            <button type="button" onClick={onCancel} className="admin-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="admin-save-btn">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// DeleteConfirmModal Component
const DeleteConfirmModal = ({ groupName, onConfirm, onCancel }) => {
  return (
    <div className="admin-modal-overlay">
      <div className="admin-modal admin-confirm-modal">
        <div className="admin-modal-header">
          <h3>Confirm Deletion</h3>
        </div>

        <div className="admin-modal-content">
          <p>Are you sure you want to delete the group <strong>"{groupName}"</strong>?</p>
          <p className="admin-warning">This action cannot be undone.</p>
        </div>

        <div className="admin-modal-actions">
          <button onClick={onCancel} className="admin-cancel-btn">
            Cancel
          </button>
          <button onClick={onConfirm} className="admin-confirm-delete-btn">
            <Trash2 size={16} />
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
};