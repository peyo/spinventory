import { useEffect, useState } from "react";
import { Container, Typography, List, ListItem, ListItemText, IconButton, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { auth } from "../../config/firebase"; // Ensure you have the correct import
import { ref, remove } from "firebase/database";
import { database } from "../../config/firebase"; // Adjust the path as necessary
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link, useNavigate } from "react-router-dom"; // Import Link and useNavigate for navigation
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import back icon

const Records = () => {
    const [tallies, setTallies] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser; // Get the currently logged-in user
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        if (user) {
            const fetchTallies = async () => {
                try {
                    const response = await fetch(`http://localhost:3000/api/records/tallies/${user.email}`);
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
                } finally {
                    setLoading(false);
                }
            };
    
            fetchTallies();
        }
    }, [user]);

    const handleDelete = (id) => {
        const tallyRef = ref(database, `bins/${user.uid}/tallies/${id}`);
        remove(tallyRef)
            .then(() => {
                toast.success("Record deleted successfully!"); // Show success notification
            })
            .catch((error) => {
                console.error("Error deleting tally:", error);
            });
    };

    const handleEdit = (tally) => {
        navigate('/tally', { state: { tally } }); // Ensure tally includes date and condition
    };

    return (
        <Container sx={{ paddingTop: 4, textAlign: "center" }}>
            <ToastContainer />
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
                                secondary={`Created At: ${new Date(tally.createdAt * 1000).toLocaleString()}`}
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
        </Container>
    );
};

export default Records;