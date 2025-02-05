import { useState } from "react";
import { TextField, Container, Typography, IconButton, Link, Snackbar } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../config/firebase"; // Ensure this path is correct
import { useNavigate } from "react-router-dom";
import API_URL from "../../config/config"; // Import the API URL

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // Get the user object

      // Fetch user role from the server
      const userRole = await fetchUserRole(user.uid); // Fetch the user's role

      // Redirect based on user role
      if (userRole === "tallier") {
        navigate("/tally"); // Redirect to Tally page
      } else if (userRole === "accountant") {
        navigate("/accounting"); // Redirect to Accounting page
      } else if (userRole === "admin") {
        navigate("/user-management"); // Redirect to User Management page
      } else {
        setSnackbarMessage("Role not recognized."); // Handle unexpected roles
        setSnackbarOpen(true); // Open Snackbar
      }
    } catch (error) {
      setSnackbarMessage(error.message); // Set error message for display
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
      {/* App Name */}
      <Typography variant="h5" sx={{ marginBottom: 4, fontWeight: "bold", color: "#000" }}>
        Spinventory
      </Typography>

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
          "&:hover": { backgroundColor: "#007AFF" },
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

// Function to fetch user role from the server
const fetchUserRole = async (userId) => {
  // Get the current user's email
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('No user is currently logged in');
  }

  // Add requestingUser as a query parameter
  const response = await fetch(
    `${API_URL}/api/user/${userId}?requestingUser=${encodeURIComponent(currentUser.email)}`
  );

  // Check if the response is OK (status code 200)
  if (!response.ok) {
    const errorText = await response.text(); // Get the error response as text
    throw new Error(`Error fetching user role: ${errorText}`); // Throw an error with the response text
  }

  const data = await response.json(); // Parse the response as JSON
  return data.role; // Return the user's role
};

export default Login;