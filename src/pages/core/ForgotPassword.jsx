import { useState } from "react"; // Import useState for managing state
import { TextField, Container, Typography, IconButton, Snackbar } from "@mui/material"; // Import Snackbar for notifications
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { getAuth, sendPasswordResetEmail } from "firebase/auth"; // Import Firebase Auth functions

const ForgotPassword = () => {
  const [email, setEmail] = useState(""); // State to hold the email input
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State to control Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(""); // State to hold Snackbar message

  const handleEmailChange = (event) => {
    setEmail(event.target.value); // Update email state on input change
  };

  const handleSubmit = async () => {
    const auth = getAuth(); // Get the Firebase Auth instance
    try {
      await sendPasswordResetEmail(auth, email); // Send password reset email
      setSnackbarMessage("Password reset email sent!"); // Set success message
      setSnackbarOpen(true); // Open Snackbar
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setSnackbarMessage("Failed to send password reset email."); // Set error message
      setSnackbarOpen(true); // Open Snackbar
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
      {/* Title */}
      <Typography variant="h5" sx={{ marginBottom: 4, fontWeight: "bold", color: "#000" }}>
        Forgot Password
      </Typography>

      {/* Email Field */}
      <TextField 
        label="Enter your email" 
        fullWidth 
        margin="normal" 
        variant="outlined"
        value={email} // Bind the email state to the TextField
        onChange={handleEmailChange} // Handle input change
        sx={{ 
          backgroundColor: "rgba(118, 118, 128, 0.12)", 
          borderRadius: 12, 
          "& .MuiOutlinedInput-root": { borderRadius: 12 } 
        }}
      />

      {/* Circular Submit Button */}
      <IconButton 
        onClick={handleSubmit} // Call handleSubmit on button click
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

      {/* Small Text Instruction */}
      <Typography variant="body2" sx={{ marginTop: 2, color: "#666" }}>
        You&apos;ll receive an email with instructions to reset your password.
      </Typography>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default ForgotPassword;