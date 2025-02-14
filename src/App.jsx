import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/core/Login";
import ForgotPassword from "./pages/core/ForgotPassword";
import SignUp from "./pages/core/SignUp";
import Tally from "./pages/tallier/Tally";
import Records from "./pages/tallier/Records";
import UserManagement from "./pages/manager/UserManagement";
import BinCount from './pages/manager/BinCount';
import Accounting from './pages/accountant/Accounting';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';

function Main() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Tallier Routes */}
        <Route path="/tally" element={
          <ProtectedRoute allowedRoles={['tallier']}>
            <Tally />
          </ProtectedRoute>
        } />
        <Route path="/records" element={
          <ProtectedRoute allowedRoles={['tallier']}>
            <Records />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/user-management" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/bin-count" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BinCount />
          </ProtectedRoute>
        } />

        {/* Accountant Routes */}
        <Route path="/accounting" element={
          <ProtectedRoute allowedRoles={['accountant']}>
            <Accounting />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default Main;
