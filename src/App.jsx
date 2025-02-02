import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import SignUp from "./pages/SignUp";
import Tally from "./pages/Tally";
import Records from './pages/Records';
import './App.css';

function Main() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/tally" element={<Tally />} />
        <Route path="/records" element={<Records />} />
      </Routes>
    </Router>
  );
}

export default Main;
