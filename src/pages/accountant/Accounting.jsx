import { useState } from "react";
import { Container, Typography, Button, Box, Snackbar, TextField, IconButton } from "@mui/material";
import DatePicker from "react-datepicker"; // Import React Datepicker
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for styling
import { Parser } from '@json2csv/plainjs'; // Import the Parser class
import LogoutIcon from '@mui/icons-material/Logout'; // Import the logout icon
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import { auth } from "../../config/firebase"; // Ensure this path is correct
import { fetchAccountingData, sendCSVEmail } from "./utils/accountApi";

const Accounting = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [email, setEmail] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      setSnackbarMessage("Logout failed: " + error.message);
      setSnackbarOpen(true);
    }
  };

  const handleSendCSV = async () => {
    setLoading(true);
    try {
      // Convert startDate and endDate to Unix timestamps
      const startUnix = Math.floor(new Date(startDate.setUTCHours(12, 0, 0)).getTime() / 1000);
      const endUnix = Math.floor(new Date(endDate.setUTCHours(23, 59, 59)).getTime() / 1000); // Adjust to end of the day

      console.log("Start Timestamp:", startUnix);
      console.log("End Timestamp:", endUnix);

      // Fetch data using the new API function
      const data = await fetchAccountingData(startUnix, endUnix);
      console.log("Fetched data:", data); // Log the fetched data

      // Convert the object to an array
      const dataArray = Object.values(data); // Convert the object to an array

      // Check if dataArray is an array
      if (!Array.isArray(dataArray)) {
        console.error("Expected an array but received:", dataArray);
        setSnackbarMessage("No data available.");
        setSnackbarOpen(true);
        return;
      }

      // Format the data for CSV
      const formattedData = [];

      dataArray.forEach(item => {
        // If tallies exist, create a row for each tally
        if (item.tallies) {
          Object.entries(item.tallies).forEach(([key, value]) => {
            const [price, count] = [key, value]; // Split key and value
            formattedData.push({
              binId: item.binId,
              condition: item.condition,
              counter: item.counter,
              createdAt: new Date(item.createdAt * 1000).toLocaleString(), // Format the date
              submittedBy: item.submittedBy,
              tallier: item.tallier,
              price: price, // Price from the tally key
              count: count // Count from the tally value
            });
          });
        } else {
          // If no tallies, just push the item as is with empty price and count
          formattedData.push({
            binId: item.binId,
            condition: item.condition,
            counter: item.counter,
            createdAt: new Date(item.createdAt * 1000).toLocaleString(), // Format the date
            submittedBy: item.submittedBy,
            tallier: item.tallier,
            price: '', // No price
            count: '' // No count
          });
        }
      });

      // Convert JSON data to CSV
      const parser = new Parser(); // Create a new Parser instance
      const csv = parser.parse(formattedData); // Use the parse method to convert data to CSV

      // Send email using the new API function
      await sendCSVEmail(email, csv);

      setSnackbarMessage("CSV sent successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("An error occurred:", error);
      setSnackbarMessage("Failed to send email. Please try again.");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !startDate || !endDate || !email;

  return (
    <Container sx={{ paddingTop: 4, maxWidth: '600px', margin: '0 auto', textAlign: "center" }}>
      {/* Logout Button */}
      <IconButton 
        onClick={handleLogout}
        sx={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: "white",
            color: "#007AFF",
            borderRadius: "50%",
            width: 48,
            height: 48,
            "&:hover": { backgroundColor: "#f0f0f0" },
        }}
      >
        <LogoutIcon />
      </IconButton>

      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: "#000", marginBottom: 3 }}>
        Accounting
      </Typography>

      <Box sx={{ marginBottom: 2 }}> {/* Adjusted marginBottom for spacing */}
        <div style={{ position: 'relative', width: '100%' }}>
            <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="MM/dd/yyyy"
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
            dateFormat="MM/dd/yyyy"
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

export default Accounting;