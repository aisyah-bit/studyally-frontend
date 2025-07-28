import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../pages/firebaseConfig';

// Admin email whitelist
const adminEmails = [
  "admin@studyally.com",
  "admin@gmail.com",
  "studyally.admin@gmail.com",
  "alyashauqi@gmail.com" // Temporary for testing
];

const AdminProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        // Check if user email is in admin whitelist
        const userIsAdmin = adminEmails.includes(user.email?.toLowerCase());
        setIsAdmin(userIsAdmin);
        
        // Also check localStorage for admin session
        const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
        const storedAdminEmail = localStorage.getItem('adminEmail');
        
        if (storedIsAdmin && storedAdminEmail && adminEmails.includes(storedAdminEmail.toLowerCase())) {
          setIsAdmin(true);
        }
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        // Clear admin session if user is not authenticated
        localStorage.removeItem('adminUid');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('isAdmin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default AdminProtectedRoute;
