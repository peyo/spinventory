import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SignUp from "./pages/SignUp";
import Tally from "./pages/tallier/Tally";
import Records from "./pages/tallier/Records";
import UserManagement from "./pages/manager/UserManagement";
import BinCount from './pages/manager/BinCount';
import './styles/App.css';

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/tally" element={<Tally />} />
        <Route path="/records" element={<Records />} />
        <Route path="/user-management" element={<UserManagement />} />
        <Route path="/bin-count" element={<BinCount />} />
      </Routes>
    </Router>
  );
}

export default Main;
