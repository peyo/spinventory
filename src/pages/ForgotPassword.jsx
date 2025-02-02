import { TextField, Container, Typography, IconButton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const ForgotPassword = () => {
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
        sx={{ 
          backgroundColor: "rgba(118, 118, 128, 0.12)", 
          borderRadius: 12, 
          "& .MuiOutlinedInput-root": { borderRadius: 12 } 
        }}
      />

      {/* Circular Submit Button */}
      <IconButton 
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

      {/* Small Text Instruction */}
      <Typography variant="body2" sx={{ marginTop: 2, color: "#666" }}>
        You&apos;ll receive an email with instructions to reset your password.
      </Typography>
    </Container>
  );
};

export default ForgotPassword;
