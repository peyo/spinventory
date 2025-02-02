import { useState } from "react";
import { TextField, Container, Typography, IconButton, Link } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/tally"); // Redirect to tallying page after login
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <Container 
      maxWidth="xs" 
      sx={{ 
        textAlign: "center", 
        marginTop: 12, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center",
      }}
    >
      {/* App Name */}
      <Typography variant="h5" sx={{ marginBottom: 4, fontWeight: "bold", color: "#000" }}>
        Spinventory
      </Typography>

      {/* Display Errors */}
      {error && <Typography color="error">{error}</Typography>}

      {/* Email Field */}
      <TextField 
        label="Email" 
        fullWidth 
        margin="normal" 
        variant="outlined" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
        sx={{ 
          backgroundColor: "rgba(118, 118, 128, 0.12)", 
          borderRadius: 12, 
          "& .MuiOutlinedInput-root": { borderRadius: 12 } 
        }}
      />

      {/* Password Field */}
      <TextField 
        label="Password" 
        fullWidth 
        margin="normal" 
        type="password" 
        variant="outlined" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
        sx={{ 
          backgroundColor: "rgba(118, 118, 128, 0.12)", 
          borderRadius: 12,
          "& .MuiOutlinedInput-root": { borderRadius: 12 } 
        }}
      />

      {/* Circular Login Button */}
      <IconButton 
        onClick={handleLogin}
        sx={{
          width: 56,
          height: 56,
          marginTop: 3,
          backgroundColor: "#007AFF", 
          color: "white",
          "&:hover": { backgroundColor: "#005EC2" },
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>

      {/* Forgot Password & Sign Up Links */}
      <Typography sx={{ marginTop: 2 }}>
        <Link component="button" variant="body2" onClick={() => navigate("/forgot-password")}>
          Forgot Password?
        </Link>
      </Typography>
      <Typography sx={{ marginTop: 1 }}>
        <Link component="button" variant="body2" onClick={() => navigate("/sign-up")}>
          Sign Up
        </Link>
      </Typography>
    </Container>
  );
};

export default Login;
