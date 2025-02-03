import { useState } from "react";
import { TextField, Container, Typography, IconButton, Snackbar } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth"; // Import the method
import { auth } from "../config/firebase";
import { getDatabase, ref, set } from "firebase/database"; // Import database functions
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      setSnackbarMessage("Passwords do not match.");
      setSnackbarOpen(true);
      return;
    }

    try {
      // Check if the email is already registered
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);
      if (signInMethods.length > 0) {
        throw new Error("An account with this email already exists.");
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the user object

      // Get a reference to the database
      const db = getDatabase();

      // Store user data in the database
      await set(ref(db, 'users/' + user.uid), {
        email: user.email,
        role: "tallier"
      });

      console.log("User created and data stored successfully!");

      // Redirect to tallying page after signup
      navigate("/tally");
    } catch (error) {
      setSnackbarMessage(error.message); // Set error message
      setSnackbarOpen(true); // Open Snackbar
    }
  };

  // Handle Snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
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

      {/* Snackbar for error messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default SignUp;