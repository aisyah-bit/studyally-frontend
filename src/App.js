import { Routes, Route, Navigate } from "react-router-dom";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import Homepage from "./pages/dashboard";
import StudySpot from "./pages/StudySpot";
import Profile from "./pages/Profile";
import SearchGroup from "./pages/SearchStudyGroup"
import CreateGroup from "./pages/CreateStudyGroup"
import  Logout  from "./pages/logout";
import GroupChat from "./pages/GroupChats";
import ForgotPassword from "./pages/ForgotPassword";
import StudySpotReview from './pages/StudySpotReview';

// Admin Components
import AdminLogin from "./admin/AdminLogin";
import AdminDashboard from "./admin/AdminDashboard";
import AdminManageGroups from "./admin/AdminManageGroups";
import AdminManageUsers from "./admin/AdminManageUsers";
import AdminProtectedRoute from "./admin/AdminProtectedRoute";
import CreateAdminAccount from "./admin/CreateAdminAccount";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LogIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Homepage />} />
      <Route path="/study-spots" element={<StudySpot />} />
      <Route path="/study-spot-reviews/:spotId" element={<StudySpotReview />} />
      <Route path="/manage-profile" element={<Profile />} />
      <Route path="/search-group" element={<SearchGroup />} />
      <Route path="/create-group" element={<CreateGroup />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/group-chat/:groupId" element={<GroupChat />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/create-account" element={<CreateAdminAccount />} />
      <Route path="/admin/dashboard" element={
        <AdminProtectedRoute>
          <AdminDashboard />
        </AdminProtectedRoute>
      } />
      <Route path="/admin/manage-groups" element={
        <AdminProtectedRoute>
          <AdminManageGroups />
        </AdminProtectedRoute>
      } />
      <Route path="/admin/manage-users" element={
        <AdminProtectedRoute>
          <AdminManageUsers />
        </AdminProtectedRoute>
      } />
    </Routes>
  );
}
