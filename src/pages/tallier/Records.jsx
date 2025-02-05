import { useEffect, useState } from "react";
import { Container, Typography, List, ListItem, ListItemText, IconButton, CircularProgress, Snackbar } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { auth } from "../../config/firebase"; // Ensure you have the correct import
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate for navigation
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import back icon

const Records = () => {
    const [tallies, setTallies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message state
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar open state
    const user = auth.currentUser; // Get the currently logged-in user
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        if (user) {
            const fetchTallies = async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/records/${user.email}`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    const data = await response.json();
    
                    // Convert the data into an array for easier rendering
                    const tallyList = Object.keys(data).map(key => ({
                        id: key,
                        ...data[key]
                    }));
    
                    setTallies(tallyList);
                } catch (error) {
                    console.error("Error fetching tallies:", error);
                    setSnackbarMessage("Error fetching tallies: " + error.message); // Set error message
                    setSnackbarOpen(true); // Open Snackbar
                } finally {
                    setLoading(false);
                }
            };
    
            fetchTallies();
        }
    }, [user]);

    const handleDelete = async (id) => {
        const tallyToDelete = tallies.find(tally => tally.id === id);
        if (!tallyToDelete) {
            setSnackbarMessage("Tally not found.");
            setSnackbarOpen(true);
            return;
        }
    
        try {
            const response = await fetch(`http://localhost:3000/api/records/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    submittedBy: user.email
                })
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete tally');
            }
    
            setSnackbarMessage("Record deleted successfully!"); // Replace toast with Snackbar
            setSnackbarOpen(true);
            setTallies(prevTallies => prevTallies.filter(t => t.id !== id));
        } catch (error) {
            console.error("Error deleting tally:", error);
            setSnackbarMessage("Error deleting tally: " + error.message);
            setSnackbarOpen(true);
        }
    };

    const handleEdit = (tally) => {
        navigate('/tally', { state: { tally } }); // Ensure tally includes date and condition
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Container sx={{ paddingTop: 4, textAlign: "center" }}>
            <IconButton 
                component={Link}
                to="/tally" // Path to the Tally page
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
            <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 3 }}>
                Submitted Tallies
            </Typography>
            {loading ? (
                <CircularProgress /> // Show loading indicator
            ) : (
                <List>
                    {tallies.map((tally) => (
                        <ListItem 
                            key={tally.id} 
                            disableGutters // Disable default padding
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                margin: 0 // Ensure no additional margins
                            }}
                        >
                            <ListItemText
                                primary={`Bin #${tally.binId} - ${tally.condition}`}
                                secondary={`Created On: ${new Date(tally.createdAt * 1000).toLocaleDateString()}`}
                            />
                            <div style={{ display: 'flex', gap: '8px' }}> {/* Flexbox for side-by-side buttons */}
                                <IconButton onClick={() => handleEdit(tally)}>
                                    <EditIcon />
                                </IconButton>
                                <IconButton onClick={() => handleDelete(tally.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </div>
                        </ListItem>
                    ))}
                </List>
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

export default Records;