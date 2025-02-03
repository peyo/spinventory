import { useState } from "react";
import { Container, Typography, Button, Box, IconButton, Snackbar, TextField } from "@mui/material";
import DatePicker from "react-datepicker"; // Import React Datepicker
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for styling
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back arrow icon
import { Link } from "react-router-dom"; // Import Link for navigation

const AccountingPage = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [email, setEmail] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendCSV = async () => {
    setLoading(true);
    // Logic to send CSV
    // On success:
    setSnackbarMessage("CSV sent successfully!");
    setSnackbarOpen(true);
    setLoading(false);
    // On error:
    // setSnackbarMessage("Failed to send email. Please try again.");
    // setSnackbarOpen(true);
    // setLoading(false);
  };

  const isButtonDisabled = !startDate || !endDate || !email;

  return (
    <Container sx={{ paddingTop: 4, maxWidth: '600px', margin: '0 auto', textAlign: "center" }}>
      {/* Back Button */}
      <IconButton 
        component={Link}
        to="/user-management"
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          backgroundColor: "#007AFF",
          color: "white",
          borderRadius: "50%",
          width: 48,
          height: 48,
          "&:hover": { backgroundColor: "#007AFF" },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: "#000", marginBottom: 3 }}>
        Accounting
      </Typography>

      <Box sx={{ marginBottom: 2 }}> {/* Adjusted marginBottom for spacing */}
        <div style={{ position: 'relative', width: '100%' }}>
            <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="yyyy/MM/dd"
            placeholderText="Start Date"
            wrapperClassName="date-picker" // Use the wrapper class for styling
            customInput={
                <TextField 
                fullWidth 
                variant="outlined" 
                sx={{ 
                    borderRadius: 12, 
                    "& .MuiOutlinedInput-root": { 
                    borderRadius: 12, 
                    "& fieldset": { borderColor: "transparent" } // Remove border color
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent" // Remove border color on hover
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent" // Remove border color when focused
                    }
                }} 
                />
            }
            popperProps={{
                modifiers: [
                {
                    name: 'zIndex',
                    options: {
                    zIndex: 1300, // Set a high zIndex for the calendar
                    },
                },
                ],
            }}
            // Ensure the calendar is rendered in a portal
            portalId="root-portal" // Ensure this ID exists in your HTML
            />
        </div>
      </Box>

      <Box sx={{ marginBottom: 2 }}> {/* Adjusted marginBottom for spacing */}
        <div style={{ position: 'relative', width: '100%' }}>
            <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="yyyy/MM/dd"
            placeholderText="End Date"
            wrapperClassName="date-picker" // Use the wrapper class for styling
            customInput={
                <TextField 
                fullWidth 
                variant="outlined" 
                sx={{ 
                    borderRadius: 12, 
                    "& .MuiOutlinedInput-root": { 
                    borderRadius: 12, 
                    "& fieldset": { borderColor: "transparent" } // Remove border color
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent" // Remove border color on hover
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "transparent" // Remove border color when focused
                    }
                }} 
                />
            }
            popperProps={{
                modifiers: [
                {
                    name: 'zIndex',
                    options: {
                    zIndex: 1300, // Set a high zIndex for the calendar
                    },
                },
                ],
            }}
            // Ensure the calendar is rendered in a portal
            portalId="root-portal" // Ensure this ID exists in your HTML
            />
        </div>
      </Box>

      {/* Email Input */}
      <Box sx={{ marginBottom: 2 }}> {/* Adjusted marginBottom for spacing */}
        <TextField 
          label="Email *" 
          fullWidth 
          margin="none" 
          variant="outlined" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          sx={{ 
            backgroundColor: "rgba(118, 118, 128, 0.12)", 
            borderRadius: 12, 
            "& .MuiOutlinedInput-root": { borderRadius: 12 } 
          }}
        />
      </Box>

      {/* Send Button */}
      <Button 
        variant="contained" 
        onClick={handleSendCSV}
        disabled={isButtonDisabled || loading}
        sx={{
          backgroundColor: "#007AFF",
          color: "white",
          borderRadius: 12,
          marginBottom: 6,
          display: "block",
          mx: "auto",
          boxShadow: "none",
          "&:hover": { backgroundColor: "#007AFF", boxShadow: "none" }
        }}
      >
        {loading ? "Sending..." : "Send CSV"}
      </Button>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default AccountingPage;