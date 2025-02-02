import { useState, useEffect } from "react";
import { Container, TextField, Typography, Button, IconButton, Select, MenuItem } from "@mui/material";
import DatePicker from "react-datepicker"; // Import React Datepicker
import "react-datepicker/dist/react-datepicker.css"; // Import CSS for styling
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import back icon
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import { ref, onValue } from "firebase/database";
import { database } from "../config/firebase"; // Adjust the path as necessary

const pricesNew = Array.from({ length: 99 }, (_, i) => (i + 1) + 0.99);
const pricesUsed = Array.from({ length: 100 }, (_, i) => i + 1);

const Tally = () => {
  const [bin, setBin] = useState("");
  const [condition, setCondition] = useState("white");
  const [counter, setCounter] = useState("");
  const [tallier, setTallier] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [tallies, setTallies] = useState({});
  const [manualPrices, setManualPrices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date()); // State for selected date
  const [user, setUser] = useState(null); // State to hold the user
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
  };

  const handleTallyChange = (price, delta) => {
    setTallies((prevTallies) => {
      const sanitizedPrice = Math.round(price * 100); // Sanitize for key access
      const newCount = Math.max((prevTallies[sanitizedPrice] || 0) + delta, 0);
      return {
        ...prevTallies,
        [sanitizedPrice]: newCount,
      };
    });
  };

  const handleManualPriceAdd = () => {
    const priceValue = parseFloat(manualPrice);
    if (isNaN(priceValue) || priceValue <= 0) return; // Ensure the price is a valid positive number
    const sanitizedPrice = Math.round(priceValue); // Sanitize for key access (as an integer)
    
    // Add the manual price to tallies
    setTallies((prev) => ({ ...prev, [sanitizedPrice]: 0 })); // Initialize count for this manual price
    setManualPrices((prev) => [...prev, priceValue]); // Keep track of manual prices for display
    setManualPrice(""); // Clear the input field
  };

  const handleManualPriceDelete = (price) => {
    setTallies((prev) => {
      const newTallies = { ...prev };
      delete newTallies[price];
      return newTallies;
    });
    setManualPrices((prev) => prev.filter((p) => p !== price));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Check if the bin field is empty
    if (!bin) {
        alert("Bin # is required."); // Display an alert if bin is empty
        return; // Prevent form submission
    }

    // Convert the selected date to a Unix timestamp (in milliseconds)
    const dateKey = Math.floor(selectedDate.getTime() / 1000); // Convert to seconds

    if (!user) {
        console.error("No user is currently logged in.");
        return; // Prevent submission if no user is logged in
    }

    const dataToSubmit = {
        condition,
        counter: counter || null,
        tallier: tallier || null,
        tallies,
        createdAt: Math.floor(new Date().getTime() / 1000), // Store createdAt as Unix timestamp
        submittedBy: user.email,
    };

    console.log("Data to submit:", dataToSubmit);
    console.log("Bin value:", bin); // Check the bin value

    try {
        const response = await fetch(`http://localhost:3000/bins/${bin}/tallies/${dateKey}`, { // Use date as key
            method: 'POST', // Use POST to add or update the entry
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSubmit), // Send the data including the date
        });

        if (!response.ok) {
            const errorBody = await response.text(); // Get the error response body
            console.error("Error response:", errorBody); // Log the error response
            throw new Error('Network response was not ok');
        }

        const responseData = await response.json();
        alert("Data submitted successfully!");
        console.log("Response from server:", responseData);

        // Clear all relevant state variables
        setBin(""); // Clear the bin input
        setCondition("white"); // Reset condition to default
        setCounter(""); // Clear the counter input
        setTallier(""); // Clear the tallier input
        setTallies({}); // Clear the tallies object
        setManualPrices([]); // Clear manual prices
        setSelectedDate(new Date()); // Reset the date to the current date

    } catch (error) {
        console.error("Error submitting data:", error);
        alert("Failed to submit data.");
    }
  };

  const handleReset = () => {
    setTallies({});
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
        console.log("User ID:", currentUser.uid); // Log user ID
        console.log("User Email:", currentUser.email); // Log user email
        console.log("User Display Name:", currentUser.displayName); // Log user display name
      } else {
        setUser(null); // Set user to null if not logged in
        console.log("No user is currently logged in.");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

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
          "&:hover": { backgroundColor: "#0056b3" }, // Darker shade on hover
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
          backgroundColor: "#007AFF",
          color: "white",
          borderRadius: "50%",
          width: 48,
          height: 48,
          "&:hover": { backgroundColor: "#007AFF" },
        }}
      >
        <LogoutIcon />
      </IconButton>

      <form onSubmit={handleSubmit}>
        <TextField 
          label="Bin # *" 
          value={bin} 
          onChange={(e) => setBin(e.target.value)} 
          fullWidth 
          margin="normal" 
          sx={{
            backgroundColor: "rgba(118, 118, 128, 0.12)",
            borderRadius: 12,
            "& .MuiOutlinedInput-root": { borderRadius: 12 },
            marginBottom: 2
          }} 
        />
        
        <div style={{ position: 'relative', zIndex: 1000 }}>
            <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                dateFormat="yyyy/MM/dd"
                placeholderText="Select Date"
                wrapperClassName="date-picker" // Use the wrapper class for styling
            />
        </div>

        <Select 
          value={condition} 
          onChange={(e) => setCondition(e.target.value)} 
          fullWidth 
          sx={{
            backgroundColor: "rgba(118, 118, 128, 0.12)",
            marginBottom: 2,
            borderRadius: 12,
            "& .MuiOutlinedInput-root": { borderRadius: 12 }
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
          margin="normal"
          sx={{
            backgroundColor: "rgba(118, 118, 128, 0.12)",
            borderRadius: 12, "& .MuiOutlinedInput-root": { borderRadius: 12 },
            marginBottom: 2
          }}
        />
        <TextField 
          label="Tallier *" 
          value={tallier} 
          onChange={(e) => setTallier(e.target.value)} 
          fullWidth 
          margin="normal"
          sx={{
            backgroundColor: "rgba(118, 118, 128, 0.12)",
            borderRadius: 12, "& .MuiOutlinedInput-root": { borderRadius: 12 },
            marginBottom: 2
          }}
        />

        {((condition === "white" ? pricesNew : pricesUsed).concat(manualPrices.sort((a, b) => a - b))).map((price) => {
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
                    onClick={() => handleManualPriceDelete(price)} 
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
                      "&:hover": { backgroundColor: "red", boxShadow: "none" } // Keep the same color on hover
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
              marginBottom: 3
            }}
        />
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
          type="submit"
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
          Submit
        </Button>
        <Button onClick={handleReset}
          variant="outlined"
          color="error"
          sx={{
            borderRadius: 12,
            marginBottom: 3,
            display: "block",
            mx: "auto",
            "&:hover": { borderColor: "error.main", backgroundColor: "transparent" } // Keep the same color on hover
          }}
        >
          Reset Count
        </Button>
      </form>
    </Container>
  );
};

export default Tally;