import React, { useEffect, useState, useRef } from 'react';
import { db } from '../pages/firebaseConfig';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import AdminLayout from './AdminLayout';
import { formatDate, sortByCreatedAt } from './utils/dateUtils';
import {
  Trash2,
  Users,
  Mail,
  Calendar,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react';
import './AdminManageUsers.css';

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showScrollIndicators, setShowScrollIndicators] = useState(false);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const usersContainerRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'users'));
      const userData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort users by creation date (newest first)
      const sortedUsers = sortByCreatedAt(userData, 'desc');
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(users.filter(user => user.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user. Please try again.");
    }
  };

  // Scroll functionality
  const checkScrollPosition = () => {
    if (usersContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = usersContainerRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(scrollTop < scrollHeight - clientHeight - 1);
      setShowScrollIndicators(scrollHeight > clientHeight);
    }
  };

  const scrollToTop = () => {
    if (usersContainerRef.current) {
      usersContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const scrollToBottom = () => {
    if (usersContainerRef.current) {
      usersContainerRef.current.scrollTo({
        top: usersContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    checkScrollPosition();
  };

  // Filter users based on search and date
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    // Date filtering
    let matchesDate = true;
    if (filterPeriod !== "all" && user.createdAt) {
      const userDate = new Date(user.createdAt);
      const now = new Date();
      
      switch (filterPeriod) {
        case "today":
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          matchesDate = userDate >= today;
          break;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = userDate >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = userDate >= monthAgo;
          break;
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          matchesDate = userDate >= yearAgo;
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesDate;
  });

  useEffect(() => {
    checkScrollPosition();
  }, [users, filteredUsers]);

  const formatUserDateTime = (dateString) => {
    return formatDate(dateString, 'datetime');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const getMemberStatus = (user) => {
    if (user.lastLogin) {
      const lastLogin = new Date(user.lastLogin);
      const now = new Date();
      const daysSinceLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLogin <= 7) return 'Active';
      if (daysSinceLogin <= 30) return 'Recent';
      return 'Inactive';
    }
    return 'New';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return '#10b981';
      case 'Recent': return '#f59e0b';
      case 'Inactive': return '#ef4444';
      case 'New': return '#6366f1';
      default: return '#6b7280';
    }
  };

  return (
    <AdminLayout>
      <div className="admin-manage-users-page">
        <div className="admin-manage-header">
          <h1>Manage Users</h1>
          <p>View and manage all registered users on the platform</p>
        </div>

        {/* Controls */}
        <div className="admin-controls">
          <div className="admin-search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="admin-filter-box">
            <Filter size={20} />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
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
            <p>Loading users...</p>
          </div>
        ) : (
          <div className="admin-users-wrapper">
            <div 
              className="admin-users-container"
              ref={usersContainerRef}
              onScroll={handleScroll}
            >
              {filteredUsers.length > 0 ? (
                <div className="admin-users-grid">
                  {filteredUsers.map(user => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onDelete={(id) => setShowDeleteConfirm(id)}
                      formatDate={formatUserDateTime}
                      getInitials={getInitials}
                      getMemberStatus={getMemberStatus}
                      getStatusColor={getStatusColor}
                    />
                  ))}
                </div>
              ) : (
                <div className="admin-no-users">
                  <p>No users found matching your criteria</p>
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

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="admin-modal-overlay">
            <div className="admin-modal admin-confirm-modal">
              <div className="admin-modal-header">
                <h3>Confirm Delete</h3>
                <button
                  className="admin-modal-close"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="admin-modal-content">
                <p>Are you sure you want to delete this user?</p>
                <p className="admin-warning">This action cannot be undone and will remove all user data.</p>
              </div>
              <div className="admin-modal-actions">
                <button
                  className="admin-cancel-btn"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="admin-confirm-delete-btn"
                  onClick={() => handleDelete(showDeleteConfirm)}
                >
                  <Trash2 size={16} />
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

// UserCard Component
const UserCard = ({ user, onDelete, formatDate, getInitials, getMemberStatus, getStatusColor }) => {
  const status = getMemberStatus(user);
  const statusColor = getStatusColor(status);

  return (
    <div className="admin-user-card">
      <div className="admin-user-card-header">
        <div className="admin-user-avatar">
          {getInitials(user.name)}
        </div>
        <div className="admin-user-info">
          <h3 className="admin-user-name">{user.name || 'Unknown User'}</h3>
          <div className="admin-user-email">
            <Mail size={14} />
            <span>{user.email}</span>
          </div>
        </div>
        <div className="admin-user-status" style={{ color: statusColor }}>
          <div className="admin-status-dot" style={{ backgroundColor: statusColor }}></div>
          {status}
        </div>
      </div>

      <div className="admin-user-card-body">
        <div className="admin-user-meta">
          <div className="admin-user-meta-item">
            <Calendar size={16} />
            <div>
              <span className="admin-meta-label">Joined</span>
              <span className="admin-meta-value">
                {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}
              </span>
            </div>
          </div>
          {user.lastLogin && (
            <div className="admin-user-meta-item">
              <Users size={16} />
              <div>
                <span className="admin-meta-label">Last Login</span>
                <span className="admin-meta-value">
                  {formatDate(user.lastLogin, 'relative')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="admin-user-card-footer">
        <div className="admin-user-details">
          <p>Created: {user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</p>
          <p className="admin-user-relative-date">
            {user.createdAt ? formatDate(user.createdAt, 'relative') : 'Unknown'}
          </p>
        </div>
        <div className="admin-user-actions">
          <button
            className="admin-delete-btn"
            onClick={() => onDelete(user.id)}
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
