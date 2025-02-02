import { useState } from "react";
import { TextField, Container, Typography, IconButton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/tally"); // Redirect to tallying page after signup
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
      <Typography variant="h5" sx={{ marginBottom: 4, fontWeight: "bold", color: "#000" }}>
        Sign Up
      </Typography>

      {error && <Typography color="error">{error}</Typography>}

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
          "& .MuiOutlinedInput-root": { borderRadius: 12 },
        }}
      />

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
          "& .MuiOutlinedInput-root": { borderRadius: 12 },
        }}
      />

      <TextField
        label="Confirm Password"
        fullWidth
        margin="normal"
        type="password"
        variant="outlined"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{
          backgroundColor: "rgba(118, 118, 128, 0.12)",
          borderRadius: 12,
          "& .MuiOutlinedInput-root": { borderRadius: 12 },
        }}
      />

      <IconButton
        onClick={handleSignUp}
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
    </Container>
  );
};

export default SignUp;
