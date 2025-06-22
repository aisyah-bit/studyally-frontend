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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LogIn />} /> 
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Homepage />} /> 
      <Route path="/study-spots" element={<StudySpot />} /> 
      <Route path="/manage-profile" element={<Profile />} /> 
      <Route path="/search-group" element={<SearchGroup />} /> 
      <Route path="/create-group" element={<CreateGroup />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/group-chat/:groupId" element={<GroupChat />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
}
