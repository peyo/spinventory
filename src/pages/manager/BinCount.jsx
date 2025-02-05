import { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Import the back arrow icon
import { Dialog, Container, Typography, Button, Box, IconButton, Snackbar } from "@mui/material";
import { deleteBinCount, fetchTalliesByDate } from "../../utils/managerApi"; // Import your API functions
import DatePicker from "react-datepicker"; // Import React Datepicker
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for styling
import DeleteIcon from '@mui/icons-material/Delete'; // Import the Delete icon

const BinCount = () => {
  const [startDate, setStartDate] = useState(null); // Initialize start date
  const [endDate, setEndDate] = useState(null); // Initialize end date
  const [tallies, setTallies] = useState([]); // State for tallies
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tallyToDelete, setTallyToDelete] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(""); // State for Snackbar message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar open/close

  const handleDeleteClick = (tally) => {
    setTallyToDelete(tally);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCount = async (tally) => {
      try {
          await deleteBinCount(tally.id, tally.submittedBy);
          setTallies(tallies.filter(t => t.id !== tally.id));
          setSnackbarMessage("Tally deleted successfully.");
          setSnackbarOpen(true);
          setDeleteDialogOpen(false);
          setTallyToDelete(null);
      } catch (error) {
          console.error("Error deleting bin count:", error);
          setSnackbarMessage(error.response?.data?.message || "Failed to delete tally.");
          setSnackbarOpen(true);
      }
  };

  const handleFetchTallies = async () => {
    if (startDate && endDate) {
        const startUnix = Math.floor(new Date(startDate.setUTCHours(0, 0, 0, 0)).getTime() / 1000);
        const endUnix = Math.floor(new Date(endDate.setUTCHours(23, 59, 59, 999)).getTime() / 1000);
        console.log("Fetching tallies from:", startUnix, "to:", endUnix);

        try {
            const fetchedTallies = await fetchTalliesByDate(startUnix, endUnix);

            // Add null check before processing the data
            if (!fetchedTallies) {
                setTallies([]);
                setTotalCount(0);
                setSnackbarMessage("No tallies found for the selected date range.");
                setSnackbarOpen(true);
                return;
            }

            // Convert the fetched tallies object to an array with IDs
            const talliesArray = Object.entries(fetchedTallies).map(([id, tally]) => ({
                id,
                ...tally
            }));

            setTallies(talliesArray);

            // Count the total tallies
            const total = talliesArray.reduce((acc, tally) => {
                if (tally.tallies) {
                    return acc + Object.values(tally.tallies).reduce((sum, value) => sum + value, 0);
                }
                return acc;
            }, 0);
            
            setTotalCount(total);
        } catch (error) {
            console.error("Error fetching tallies:", error);
            setTallies([]); // Set empty array on error
            setTotalCount(0); // Reset total count
            if (error.response?.status === 404) {
                setSnackbarMessage("No tallies found for the selected date range.");
            } else {
                setSnackbarMessage("Failed to fetch tallies.");
            }
            setSnackbarOpen(true);
        }
    } else {
        setSnackbarMessage("Please select both start and end dates.");
        setSnackbarOpen(true);
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
          "&:hover": { backgroundColor: "#005EC2" }, // Change color on hover
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
      
      {/* Date Picker for Start Date */}
      <DatePicker
        selected={startDate} // Use the selected start date
        onChange={(date) => setStartDate(date)} // Update start date
        dateFormat="MM/dd/yyyy"
        placeholderText="Start Date"
        wrapperClassName="date-picker"
        sx={{ marginBottom: 2 }}
      />

      {/* Date Picker for End Date */}
      <DatePicker
        selected={endDate} // Use the selected end date
        onChange={(date) => setEndDate(date)} // Update end date
        dateFormat="MM/dd/yyyy"
        placeholderText="End Date"
        wrapperClassName="date-picker"
        sx={{ marginBottom: 2 }}
      />

      <Button 
        variant="contained" 
        onClick={handleFetchTallies}
        disabled={!startDate || !endDate} // Disable button if no date range is selected
        sx={{
          backgroundColor: "#007AFF",
          color: "white",
          borderRadius: 12,
          marginBottom: 6,
          display: "block",
          mx: "auto",
          boxShadow: "none", // Removes default shadow
          "&:hover": {
            backgroundColor: "#007AFF",
            boxShadow: "none" // Ensure no shadow on hover
          }
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
                        onClick={() => handleDeleteClick(tally)} // Pass the condition for deletion
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
      {/* Confirmation Dialog */}
    <Dialog
        open={deleteDialogOpen}
        onClose={() => {
            setDeleteDialogOpen(false);
            setTallyToDelete(null);
        }}
        sx={{
            '& .MuiDialog-paper': {
                padding: '20px',
                borderRadius: '12px',
                maxWidth: '300px',
                width: '90%',
                margin: 'auto',
                marginTop: '100px'
            }
        }}
    >
        <Typography variant="h6" sx={{ fontSize: '1.1rem', marginBottom: 2 }}>
            Confirm Deletion
        </Typography>
        <Typography sx={{ fontSize: '0.9rem', marginBottom: 3 }}>
            Are you sure you want to delete this tally for Bin #{tallyToDelete?.binId}?
        </Typography>
        <div style={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            gap: '8px'
        }}>
            <Button 
                variant="outlined" 
                onClick={() => {
                    setDeleteDialogOpen(false);
                    setTallyToDelete(null);
                }}
                size="small"
                sx={{ 
                    borderRadius: 12,
                    textTransform: 'none'
                }}
            >
                Cancel
            </Button>
            <Button 
                variant="contained" 
                onClick={() => handleDeleteCount(tallyToDelete)}
                size="small"
                sx={{ 
                    borderRadius: 12,
                    backgroundColor: "#007AFF",
                    textTransform: 'none',
                    "&:hover": { backgroundColor: "#007AFF" }
                }}
            >
                Delete
            </Button>
        </div>
    </Dialog>
    </Container>
  );
};

export default BinCount;