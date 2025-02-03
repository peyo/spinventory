import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back arrow icon
import { Container, Typography, Button, Box, IconButton, Snackbar } from "@mui/material";
import { deleteBinCount, fetchTalliesByDate } from "../../utils/managerApi"; // Import your API functions
import DatePicker from "react-datepicker"; // Import React Datepicker
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for styling
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete icon

const BinCount = () => {
  const [selectedDate, setSelectedDate] = useState(null); // Initialize as null
  const [tallies, setTallies] = useState([]); // Reintroduce tallies state
  const [totalCount, setTotalCount] = useState(0);
  const [snackbarMessage, setSnackbarMessage] = useState(""); // State for Snackbar message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar open/close

  const handleDeleteCount = async (condition) => {
    if (selectedDate) {
      const dateKey = Math.floor(new Date(selectedDate.setUTCHours(12, 0, 0, 0)).getTime() / 1000);
      const tallyKey = `${dateKey}_${condition}`;
      
      console.log("Attempting to delete tally with key:", tallyKey); // Log the tallyKey
  
      try {
        await deleteBinCount(tallyKey);
        // Update the state to remove the deleted tally from the UI
        setTallies(tallies.filter(tally => tally.condition !== condition));
        setSnackbarMessage("Tally deleted successfully."); // Set success message
        setSnackbarOpen(true); // Open Snackbar
      } catch (error) {
        console.error("Error deleting bin count:", error);
        setSnackbarMessage("Failed to delete tally."); // Set error message
        setSnackbarOpen(true); // Open Snackbar
      }
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date); // Set the selected date
  };

  const handleFetchTallies = async () => {
    if (selectedDate) {
      const dateKey = Math.floor(new Date(selectedDate.setUTCHours(12, 0, 0, 0)).getTime() / 1000); // Convert to Unix timestamp
      console.log("Fetching tallies for dateKey:", dateKey); // Log the dateKey for debugging
  
      try {
        const fetchedTallies = await fetchTalliesByDate(dateKey); // Pass the Unix timestamp
  
        // Convert the fetched tallies object to an array
        const talliesArray = Object.values(fetchedTallies); // Convert object to array
  
        setTallies(talliesArray); // Store fetched tallies
  
        // Count the total tallies
        const tally = talliesArray.reduce((acc, tally) => 
          acc + Object.values(tally.tallies).reduce((sum, value) => sum + value, 0), 0
        );
        setTotalCount(tally); // Update totalCount with the tally
      } catch (error) {
        console.error("Error fetching tallies:", error); // Log any errors
        setSnackbarMessage("Failed to fetch tallies."); // Set error message
        setSnackbarOpen(true); // Open Snackbar
      }
    } else {
      console.warn("No date selected."); // Warn if no date is selected
      setSnackbarMessage("Please select a date."); // Set warning message
      setSnackbarOpen(true); // Open Snackbar
    }
  };

  // Snackbar close handler
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container sx={{ paddingTop: 4, maxWidth: '600px', margin: '0 auto', textAlign: "center", fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }}>
      
      {/* Back Button */}
      <IconButton 
        component={Link}
        to="/user-management" // Path to the User Management page
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          backgroundColor: "#007AFF",
          color: "white",
          borderRadius: "50%",
          width: 48,
          height: 48,
          "&:hover": { backgroundColor: "#007AFF" }, // Change color on hover
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ 
            fontWeight: 'bold',
            color: "#000",
            marginBottom: 3
            }}
        >
        Bin Count
      </Typography>
      
      {/* Date Picker */}
      <DatePicker
        selected={selectedDate} // Use the selected date
        onChange={handleDateChange}
        dateFormat="yyyy/MM/dd"
        placeholderText="Select Date"
        wrapperClassName="date-picker"
        sx={{ marginBottom: 2 }}
      />
      <Button 
        variant="contained" 
        onClick={handleFetchTallies}
        disabled={!selectedDate} // Disable button if no date is selected
        sx={{
          backgroundColor: "#007AFF",
          color: "white",
          borderRadius: 12,
          marginBottom: 6,
          display: "block",
          mx: "auto",
          boxShadow: "none", // Removes default shadow
          "&:hover": { backgroundColor: "#007AFF", boxShadow: "none" } // Keep the same color on hover
        }}
      >
        Fetch Tallies
      </Button>

      {totalCount > 0 && ( // Only show total count if it's greater than 0
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'medium', color: "#000", marginBottom: 3 }}>
          Total Tallies: {totalCount}
        </Typography>
      )}

        {tallies.length > 0 && ( // Only show the tallies if they exist
        <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', fontWeight: 'bold', marginBottom: 1 }}>
            <Box sx={{ flex: '1 1 100px', textAlign: 'left' }}>Bin #</Box>
            <Box sx={{ flex: '1 1 100px', textAlign: 'left' }}>Type</Box>
            <Box sx={{ flex: '1 1 100px', textAlign: 'left' }}>User</Box> {/* Adjusted width */}
            <Box sx={{ flex: '1 1 100px', textAlign: 'left' }}>Tally</Box>
            <Box sx={{ flex: '1 1 100px', textAlign: 'left' }}>Actions</Box>
            </Box>
            {tallies
            .sort((a, b) => a.binId - b.binId) // Sort tallies by binId in ascending order
            .map((tally) => {
                // Calculate the total tally from the tallies object
                const totalTally = Object.values(tally.tallies).reduce((sum, value) => sum + value, 0);

                return (
                <Box key={tally.binId} sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 1, height: '50px' }}> {/* Set a fixed height */}
                    <Box sx={{ flex: '1 1 100px', textAlign: 'left' }}>{tally.binId}</Box>
                    <Box sx={{ flex: '1 1 100px', textAlign: 'left' }}>{tally.condition}</Box>
                    <Box sx={{ flex: '1 1 100px', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tally.submittedBy}</Box> {/* Adjusted width */}
                    <Box sx={{ flex: '1 1 100px', textAlign: 'left' }}>{totalTally || 0}</Box>
                    <Box sx={{ flex: '1 1 100px', textAlign: 'left' }}>
                    <IconButton 
                        onClick={() => handleDeleteCount(tally.condition)} // Pass the condition for deletion
                    >
                        <DeleteIcon />
                    </IconButton>
                    </Box>
                </Box>
                );
            })}
        </Box>
        )}

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

export default BinCount;