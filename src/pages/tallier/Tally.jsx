import { useState, useEffect, useMemo } from "react";
import { Container, TextField, Typography, Button, IconButton, Select, MenuItem, Snackbar, Dialog } from "@mui/material";
import DatePicker from "react-datepicker"; // Import React Datepicker
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for styling
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import back icon
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useNavigate, Link, useLocation } from "react-router-dom"; // Import Link for navigation and useLocation for access passed state
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase"; // Adjust the path as necessary
import { submitTallyData, updateTally, deleteManualPrice, fetchTallyData } from "./utils/tallierApi";

const pricesNew = Array.from({ length: 99 }, (_, i) => (i + 1) + 0.99);
const pricesUsed = Array.from({ length: 100 }, (_, i) => i + 1);

const Tally = () => {
  const location = useLocation();
  const { tally } = location.state || {}; // Retrieve the tally data if available

  // Memoize tallyData to prevent unnecessary re-renders
  const tallyData = useMemo(() => tally || {}, [tally]);

  // Set initial state values based on the received tally data
  const [bin, setBin] = useState(tallyData.binId || ""); // Specific bin ID
  const [condition, setCondition] = useState(tallyData.condition || "white"); // Specific condition
  const [counter, setCounter] = useState(tallyData.counter || "");
  const [tallier, setTallier] = useState(tallyData.tallier || "");
  const [tallies, setTallies] = useState(tallyData.tallies || {});
  const [whiteTallies, setWhiteTallies] = useState({});
  const [orangeTallies, setOrangeTallies] = useState({});
  const [whiteManualPrices, setWhiteManualPrices] = useState([]); // New state for white manual prices
  const [orangeManualPrices, setOrangeManualPrices] = useState([]); // New state for orange manual prices
  const [selectedDate, setSelectedDate] = useState(
    tallyData.createdAt ? new Date(tallyData.createdAt * 1000) : new Date()
  ); // Convert createdAt to Date or default to the current date
  const [manualPrice, setManualPrice] = useState(""); // For inputting a new manual price
  const [manualPrices, setManualPrices] = useState([]); // To store the list of manual prices
  const [isEditing, setIsEditing] = useState(!!tallyData.id); // Set to true if editing
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState(null);

  const [user, setUser] = useState(null); // State to hold the user
  const [snackbarMessage, setSnackbarMessage] = useState(""); // Snackbar message state
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Snackbar open state
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      setSnackbarMessage("Logout failed: " + error.message);
      setSnackbarOpen(true);
    }
  };

  const handleTallyChange = (price, delta) => {
    const sanitizedPrice = Math.round(price * 100); // Sanitize for key access
    
    // Update the main tallies state
    setTallies((prevTallies) => {
      const newCount = Math.max((prevTallies[sanitizedPrice] || 0) + delta, 0);
      const newTallies = {
        ...prevTallies,
        [sanitizedPrice]: newCount,
      };
      
      // Also update the condition-specific state
      if (condition === "white") {
        setWhiteTallies(newTallies);
      } else {
        setOrangeTallies(newTallies);
      }
      
      return newTallies;
    });
  };

  const handleManualPriceAdd = () => {
    const priceValue = parseFloat(manualPrice);

    if (isNaN(priceValue) || priceValue <= 0) {
      setSnackbarMessage("Please enter a valid positive number for the manual price.");
      setSnackbarOpen(true);
      return;
    }
    const sanitizedPrice = Math.round(priceValue * 100);
    
    // Add the manual price to tallies
    const newTallies = { ...tallies, [sanitizedPrice]: 0 };
    setTallies(newTallies);
    
    // Update the condition-specific state
    if (condition === "white") {
      setWhiteTallies(newTallies);
      const newManualPrices = [...whiteManualPrices, priceValue];
      setWhiteManualPrices(newManualPrices);
      setManualPrices(newManualPrices); // Update current manual prices
    } else {
      setOrangeTallies(newTallies);
      const newManualPrices = [...orangeManualPrices, priceValue];
      setOrangeManualPrices(newManualPrices);
      setManualPrices(newManualPrices); // Update current manual prices
    }
    
    setManualPrice(""); // Clear the input field
  };

  const handleDeleteClick = (price) => {
    const sanitizedPrice = Math.round(price * 100);
    if (tallies[sanitizedPrice] > 0) {
        setPriceToDelete(price);
        setDeleteDialogOpen(true);
    } else {
        // If no tallies, delete directly
        handleManualPriceDelete(price);
    }
  };

  const handleManualPriceDelete = async (price) => {
    const sanitizedPrice = Math.round(price * 100);
  
    try {
        await deleteManualPrice(sanitizedPrice, user.email);
  
        setTallies((prev) => {
            const newTallies = { ...prev };
            delete newTallies[sanitizedPrice];
            
            // Update the condition-specific state
            if (condition === "white") {
                setWhiteTallies(newTallies);
                setWhiteManualPrices(prev => prev.filter(p => p !== price)); // Update white manual prices
            } else {
                setOrangeTallies(newTallies);
                setOrangeManualPrices(prev => prev.filter(p => p !== price)); // Update orange manual prices
            }
            
            return newTallies;
        });
  
        setDeleteDialogOpen(false);
        setPriceToDelete(null);
    } catch (error) {
        console.error("Error deleting manual price:", error);
        setSnackbarMessage("Failed to delete manual price: " + error.message);
        setSnackbarOpen(true);
    }
  };

  const handleReset = () => {
    // Clear all form fields
    setBin("");
    setCounter("");
    setTallier("");
    setSelectedDate(new Date());
    
    // Clear all tallies and manual prices
    setTallies({});
    setWhiteTallies({});
    setOrangeTallies({});
    setWhiteManualPrices([]); 
    setOrangeManualPrices([]); 
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check all required fields
    const missingFields = [];
    if (!bin) missingFields.push("Bin #");
    if (!condition) missingFields.push("Condition");
    if (!counter) missingFields.push("Counter");
    if (!tallier) missingFields.push("Tallier");

    if (missingFields.length > 0) {
        setSnackbarMessage(`Please fill in all required fields: ${missingFields.join(", ")}`);
        setSnackbarOpen(true);
        return;
    }

    // Convert the selected date to a Unix timestamp (in seconds)
    const dateKey = Math.floor(new Date(selectedDate.setUTCHours(12, 0, 0, 0)).getTime() / 1000);

    if (!user) {
        console.error("No user is currently logged in.");
        setSnackbarMessage("No user is currently logged in.");
        setSnackbarOpen(true);
        return;
    }

    // Only use the current condition's tallies
    const currentTallies = condition === "white" ? whiteTallies : orangeTallies;

    const dataToSubmit = {
        binId: bin,
        condition,
        counter: counter || null,
        tallier: tallier || null,
        tallies: currentTallies,
        createdAt: dateKey,
        submittedBy: user.email,
    };

    try {
        await submitTallyData(dateKey, bin, dataToSubmit);

        setSnackbarMessage("Data submitted successfully!");
        setSnackbarOpen(true);
        
        if (condition === "white") {
            setWhiteTallies({});
            setWhiteManualPrices([]);
            setTallies(orangeTallies);
            if (condition === "white") {
                setTallies({});
            }
        } else {
            setOrangeTallies({});
            setOrangeManualPrices([]);
            setTallies(whiteTallies);
            if (condition === "orange") {
                setTallies({});
            }
        }

        setIsEditing(false);

    } catch (error) {
        console.error("Error submitting data:", error);
        setSnackbarMessage("Failed to submit data: " + error.message);
        setSnackbarOpen(true);
    }
  };

  const handleEdit = async () => {
    const dateKey = Math.floor(selectedDate.getTime() / 1000);
    const updatedTally = {
        binId: bin,
        condition,
        counter,
        tallier,
        tallies,
        createdAt: dateKey,
        submittedBy: user.email
    };

    try {
        await updateTally(dateKey, bin, condition, updatedTally);
        setIsEditing(false);
        navigate("/records");
    } catch (error) {
        console.error("Error saving tally:", error);
        setSnackbarMessage("Failed to save tally: " + error.message);
        setSnackbarOpen(true);
    }
  };

  const handleCancel = () => {
    navigate("/records");
  };

  useEffect(() => {
    const tallyRef = ref(database, 'bins/');
    onValue(tallyRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Current Bins:", data);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set the user state if logged in
      } else {
        setUser(null); // Set user to null if not logged in
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch tally data when editing
  useEffect(() => {
    if (isEditing && tallyData) {
      const fetchTallyDataForEdit = async () => {
        try {
          // Validate required data
          if (!tallyData.createdAt || !tallyData.condition) {
            console.log('Invalid tally data:', tallyData);
            setSnackbarMessage("Invalid tally data provided");
            setSnackbarOpen(true);
            setIsEditing(false); // Exit edit mode
            return;
          }

          // Extract the ID components
          const idParts = tallyData.id.split('_');
          if (idParts.length < 3) { // Changed from 2 to 3 since we need all three parts
            console.log('Invalid tally ID format:', tallyData.id);
            setSnackbarMessage("Invalid tally ID format");
            setSnackbarOpen(true);
            setIsEditing(false);
            return;
          }

          // Use the date, binId, and condition from the ID
          const [date, binId, condition] = idParts; // Destructure all three parts
          
          console.log('Attempting to fetch tally with:', {
            id: tallyData.id,
            date,
            binId,
            condition,
            originalData: tallyData
          });
          
          const data = await fetchTallyData(date, binId, condition);

          if (!data) {
            throw new Error('No data received from server');
          }

          // Set state with fetched data
          setBin(data.binId || '');
          setCondition(data.condition || 'white');
          setCounter(data.counter || '');
          setTallier(data.tallier || '');
          setTallies(data.tallies || {});
          setSelectedDate(new Date(data.createdAt * 1000));

          // Determine the threshold based on the condition
          const threshold = condition === "white" ? 9999 : 10000;

          // Add null check for data.tallies
          const fetchedManualPrices = data.tallies ? Object.keys(data.tallies)
            .filter(price => !isNaN(price) && parseFloat(price) > threshold)
            .map(price => parseFloat(price) / 100) : [];

          // Set manual prices based on condition
          if (condition === "white") {
            setWhiteManualPrices(fetchedManualPrices);
          } else {
            setOrangeManualPrices(fetchedManualPrices);
          }
        } catch (error) {
          console.error("Error fetching tally data:", error);
          setSnackbarMessage("Error fetching tally data: " + error.message);
          setSnackbarOpen(true);
          // Set default values on error
          setBin('');
          setCondition('white');
          setCounter('');
          setTallier('');
          setTallies({});
          setSelectedDate(new Date());
          setManualPrices([]);
          setWhiteManualPrices([]);
          setOrangeManualPrices([]);
          // Exit edit mode on error
          setIsEditing(false);
        }
      };

      fetchTallyDataForEdit();
    }
  }, [isEditing, tallyData]);

  // Snackbar close handler
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container sx={{ paddingTop: 4, textAlign: "center" }}>
      <IconButton 
        component={Link} // Use Link for navigation
        to="/records" // Path to the Records page
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          backgroundColor: "#007AFF",
          color: "white",
          borderRadius: "50%",
          width: 48,
          height: 48,
          "&:hover": { backgroundColor: "#007AFF" }, // Darker shade on hover
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color: "#000",
          marginBottom: 3
        }}
      >
        Tally
      </Typography>
      
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

      <form onSubmit={isEditing ? handleEdit : handleSubmit}>
        <Container sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', padding: 0 }}>
          <TextField 
            label="Bin # *" 
            value={bin} 
            onChange={(e) => setBin(e.target.value)} 
            fullWidth 
            sx={{
              backgroundColor: "rgba(118, 118, 128, 0.12)",
              borderRadius: 12,
              "& .MuiOutlinedInput-root": { 
                borderRadius: 12,
              },
              marginBottom: 1,
            }} 
          />
          
          <div style={{ position: 'relative', zIndex: 1000, width: '100%' }}>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select Date"
              wrapperClassName="date-picker" // Use the wrapper class for styling
            />
          </div>

          <Select 
            value={condition} 
            onChange={(e) => {
                const newCondition = e.target.value;
                // Save current tallies before switching
                if (condition === "white") {
                    setWhiteTallies(tallies);
                } else {
                    setOrangeTallies(tallies);
                }
                // Switch to the new condition and load its tallies
                setCondition(newCondition);
                setTallies(newCondition === "white" ? whiteTallies : orangeTallies);
                // Update manual prices based on condition
                setManualPrices(newCondition === "white" ? whiteManualPrices : orangeManualPrices);
            }} 
            fullWidth 
            sx={{
              backgroundColor: "rgba(118, 118, 128, 0.12)",
              borderRadius: 12,
              "& .MuiOutlinedInput-root": { 
                borderRadius: 12,
              },
              marginBottom: 1,
            }}
          >
            <MenuItem value="white">New (White)</MenuItem>
            <MenuItem value="orange">Used (Orange)</MenuItem>
          </Select>

          <TextField 
            label="Counter *" 
            value={counter} 
            onChange={(e) => setCounter(e.target.value)} 
            fullWidth 
            sx={{
              backgroundColor: "rgba(118, 118, 128, 0.12)",
              borderRadius: 12, 
              "& .MuiOutlinedInput-root": { 
                borderRadius: 12,
              },
              marginBottom: 1,
            }}
          />

          <TextField 
            label="Tallier *" 
            value={tallier} 
            onChange={(e) => setTallier(e.target.value)} 
            fullWidth 
            sx={{
              backgroundColor: "rgba(118, 118, 128, 0.12)",
              borderRadius: 12, 
              "& .MuiOutlinedInput-root": { 
                borderRadius: 12,
              },
              marginBottom: 2,
            }}
          />
        </Container>

        {/* Clear All button at the top of tally list */}
        <Button 
          onClick={handleReset}
          variant="outlined"
          color="error"
          sx={{
            borderRadius: 12,
            marginBottom: 3,
            display: "block",
            mx: "auto",
            "&:hover": { borderColor: "error.main", backgroundColor: "transparent" }
          }}
        >
          Clear All
        </Button>

        {((condition === "white" ? pricesNew : pricesUsed)
            .concat((condition === "white" ? whiteManualPrices : orangeManualPrices).sort((a, b) => a - b)))
            .map((price) => {
                const sanitizedPrice = Math.round(price * 100); // Sanitize for key access
                return (
                    <Container 
                        key={sanitizedPrice} 
                        disableGutters 
                        sx={{ 
                            display: "grid", 
                            gridTemplateColumns: "80px 90px auto", 
                            alignItems: "center", 
                            marginY: 1,  
                            marginX: "6px",  
                            paddingX: "0 !important",  
                            maxWidth: "calc(100vw - 12px)", 
                            width: "calc(100% - 12px)", 
                            overflowX: "hidden",
                        }}
                    >
                        {/* Price and Delete Button inside the same grid cell */}
                        <Container
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                padding: "8px 0"
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    textAlign: "left",
                                    whiteSpace: "nowrap"
                                }}
                            >
                                ${price.toFixed(2)}
                            </Typography>

                            {manualPrices.includes(price) && (
                                <IconButton 
                                    onClick={() => handleDeleteClick(price)} 
                                    sx={{ 
                                        borderRadius: "50%", 
                                        width: 24, 
                                        height: 24, 
                                        padding: 0, 
                                        minWidth: "unset", 
                                        display: "flex", 
                                        alignItems: "center", 
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        boxShadow: "none", // Removes shadow
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Container>

                        {/* Tally Count - Keeps alignment intact */}
                        <Container 
                            sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "flex-end", 
                                minWidth: "90px", 
                                paddingRight: "8px" 
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    textAlign: "right", 
                                    width: "40px", 
                                    minWidth: "40px", 
                                }}
                            >
                                {tallies[sanitizedPrice] || 0}
                            </Typography>
                        </Container>

                        {/* Up & Down Buttons - No Drop Shadow */}
                        <Container
                            sx={{
                                display: "flex",
                                gap: "8px",
                                justifyContent: "flex-end",
                                padding: "8px 0"
                            }}
                        >
                            <IconButton 
                                onClick={(e) => { e.preventDefault(); handleTallyChange(price, 1); }} 
                                sx={{ 
                                    backgroundColor: "#007AFF", 
                                    color: "white", 
                                    borderRadius: "50%", 
                                    width: 48, 
                                    height: 48,
                                    flexShrink: 0,
                                    boxShadow: "none", 
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": { backgroundColor: "#007AFF" },
                                    "&:active": { 
                                        transform: "scale(0.95)", 
                                        backgroundColor: "#007AFF" // Resets to original color on release
                                    }, 
                                    "&:focus": { backgroundColor: "#007AFF" }, // Ensures it doesn't stay dark
                                }}
                            >
                                <ArrowUpwardIcon />
                            </IconButton>

                            <IconButton 
                                onClick={(e) => { e.preventDefault(); handleTallyChange(price, -1); }} 
                                sx={{ 
                                    backgroundColor: "#007AFF", 
                                    color: "white", 
                                    borderRadius: "50%", 
                                    width: 48, 
                                    height: 48,
                                    flexShrink: 0,
                                    boxShadow: "none",
                                    transition: "all 0.2s ease-in-out",
                                    "&:hover": { backgroundColor: "#007AFF" }, 
                                    "&:active": { 
                                        transform: "scale(0.95)", 
                                        backgroundColor: "#007AFF" // Resets color on release
                                    },  
                                    "&:focus": { backgroundColor: "#007AFF" }, // Prevents stuck dark state
                                }}
                            >
                                <ArrowDownwardIcon />
                            </IconButton>
                        </Container>
                    </Container>
                );
            })}
        <Container sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%', padding: 0 }}>
          <TextField 
            label="Manual Price" 
            value={manualPrice} 
            onChange={(e) => setManualPrice(e.target.value)} 
            fullWidth 
            margin="normal"
            sx={{
                backgroundColor: "rgba(118, 118, 128, 0.12)",
                borderRadius: 12,
                "& .MuiOutlinedInput-root": { borderRadius: 12 },
                marginBottom: 3,
              }}
          />
        </Container>
        <Button
          onClick={(e) => { e.preventDefault(); handleManualPriceAdd(); }}
          variant="contained"
          sx={{
            backgroundColor: "#007AFF",
            color: "white",
            borderRadius: 12,
            marginBottom: 3,
            display: "block",
            mx: "auto",
            boxShadow: "none", // Removes default shadow
            "&:hover": { backgroundColor: "#007AFF", boxShadow: "none" } // Keep the same color on hover
          }}
        >
          Add Manual Price
        </Button>

        <Button 
          type="button"
          onClick={isEditing ? handleEdit : handleSubmit}
          variant="contained"
          sx={{
            backgroundColor: "#007AFF",
            color: "white",
            borderRadius: 12,
            marginBottom: 3,
            display: "block",
            mx: "auto",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#007AFF", boxShadow: "none" }
          }}
        >
          {isEditing ? "Save" : "Submit"}
        </Button>

        {/* Changed Reset Count to Clear All at the bottom */}
        <Button 
          onClick={handleReset}
          variant="outlined"
          color="error"
          sx={{
            borderRadius: 12,
            marginBottom: 3,
            display: "block",
            mx: "auto",
            "&:hover": { borderColor: "error.main", backgroundColor: "transparent" }
          }}
        >
          Clear All
        </Button>

        {isEditing && (
          <Button onClick={handleCancel}>Cancel</Button>
        )}
      </form>

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
          setPriceToDelete(null);
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
            Are you sure you want to delete the price ${priceToDelete?.toFixed(2)}? 
            This price has existing tally counts.
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
                setPriceToDelete(null);
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
              onClick={() => handleManualPriceDelete(priceToDelete)}
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

export default Tally;