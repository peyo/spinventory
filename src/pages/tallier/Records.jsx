import { useEffect, useState } from "react";
import { Dialog, Container, Typography, List, ListItem, ListItemText, IconButton, CircularProgress, Snackbar, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { auth } from "../../config/firebase"; // Ensure you have the correct import
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate for navigation
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import back icon
import { onAuthStateChanged } from "firebase/auth";
import { fetchUserTallies, deleteTallyRecord } from "./utils/tallierApi";

const Records = () => {
    const [tallies, setTallies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [tallyToDelete, setTallyToDelete] = useState(null);
    const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message state
    const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar open state
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (!currentUser) {
                setLoading(false);
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        const fetchTallies = async () => {
            if (!user) return;

            try {
                const data = await fetchUserTallies(user.email);
    
                // Convert the data into an array for easier rendering
                const talliesList = Object.keys(data).map(key => ({
                    id: key,
                    ...data[key]
                }));
    
                setTallies(talliesList);
                
                // Show message if no tallies found
                if (talliesList.length === 0) {
                    setSnackbarMessage("No tallies found.");
                    setSnackbarOpen(true);
                }
            } catch (error) {
                console.error("Error fetching tallies:", error);
                setTallies([]); // Set empty array on error
                setSnackbarMessage("Error fetching tallies: " + error.message);
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };
    
        fetchTallies();
    }, [user]);

    const handleDeleteClick = (tally) => {
        setTallyToDelete(tally);
        setDeleteDialogOpen(true);
    };
    
    const handleDelete = async (id) => {
        try {
            await deleteTallyRecord(id, user.email);
    
            setSnackbarMessage("Record deleted successfully!");
            setSnackbarOpen(true);
            setTallies(prevTallies => prevTallies.filter(t => t.id !== id));
            setDeleteDialogOpen(false);
            setTallyToDelete(null);
        } catch (error) {
            console.error("Error deleting tally:", error);
            setSnackbarMessage("Error deleting tally: " + error.message);
            setSnackbarOpen(true);
        }
    }

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
                to="/tally"
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
                <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
                    <CircularProgress sx={{ color: '#007AFF' }} />
                </Container>
            ) : (
                <>
                    <List>
                        {tallies.map((tally) => (
                            <ListItem 
                                key={tally.id} 
                                disableGutters
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center', 
                                    margin: 0
                                }}
                            >
                                <ListItemText
                                    primary={`Bin #${tally.binId} - ${tally.condition}`}
                                    secondary={`Created On: ${new Date(tally.createdAt * 1000).toLocaleDateString()}`}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <IconButton onClick={() => handleEdit(tally)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDeleteClick(tally)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </div>
                            </ListItem>
                        ))}
                    </List>

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
                                onClick={() => handleDelete(tallyToDelete?.id)}
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
                </>
            )}
        </Container>
    );
};

export default Records;