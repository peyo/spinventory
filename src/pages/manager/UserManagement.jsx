import { useEffect, useState } from "react";
import { Button, Typography, Container, IconButton, Box, Select, MenuItem, FormControl, Snackbar } from "@mui/material";
import UserDeleteModal from "../../components/Modals/UserDeleteModal";
import { fetchUsers, deleteUser, updateUserRole } from "../../utils/managerApi"; // Import your API functions
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import back icon
import DeleteIcon from "@mui/icons-material/Delete"; // Import trash can icon
import LogoutIcon from "@mui/icons-material/Logout"; // Import logout icon
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [snackbarMessage, setSnackbarMessage] = useState(""); // State for Snackbar message
  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar open/close
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const getUsers = async () => {
      try {
        const fetchedUsers = await fetchUsers();
        // Convert fetched users object to an array
        if (fetchedUsers && typeof fetchedUsers === 'object') {
          const userArray = Object.keys(fetchedUsers).map(key => ({
            id: key,
            ...fetchedUsers[key]
          }));
          setUsers(userArray);
        } else {
          setUsers([]); // Set to empty array if data is not valid
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setSnackbarMessage("Failed to fetch users."); // Set error message
        setSnackbarOpen(true); // Open Snackbar
      }
    };
    getUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUser(userToDelete.id); // Assuming user has an id property
      setUsers(users.filter((user) => user.id !== userToDelete.id));
      setOpenDeleteModal(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      setSnackbarMessage("Failed to delete user."); // Set error message
      setSnackbarOpen(true); // Open Snackbar
    }
  };

  const handleRoleChange = (userId, newRole) => {
    // Update local state without saving to the database
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, role: newRole }; // Update the role based on dropdown selection
      }
      return user;
    });
    setUsers(updatedUsers);
  };

  const handleSaveRoles = async () => {
    // Save roles to the database
    try {
      await Promise.all(users.map(user => 
        updateUserRole(user.id, { role: user.role }) // Save the updated role
      ));
      setSnackbarMessage("User roles saved successfully!"); // Set success message
      setSnackbarOpen(true); // Open Snackbar
    } catch (error) {
      console.error("Error saving user roles:", error);
      setSnackbarMessage("Failed to save user roles."); // Set error message
      setSnackbarOpen(true); // Open Snackbar
    }
  };

  const handleLogout = () => {
    // Clear user session (e.g., remove token from local storage)
    localStorage.removeItem("authToken"); // Adjust this based on your authentication method
    console.log("User logged out");
    navigate("/"); // Redirect to login page after logout
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
      <IconButton 
        onClick={() => navigate("/bin-count")} // Navigate to the Bin View
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          backgroundColor: "#007AFF",
          color: "white",
          borderRadius: "50%",
          width: 48,
          height: 48,
          "&:hover": { backgroundColor: "#007AFF" }
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <IconButton 
        onClick={handleLogout} // Handle logout when clicked
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          backgroundColor: "#c",
          color: "white",
          borderRadius: "50%",
          width: 48,
          height: 48,
          "&:hover": { backgroundColor: "#007AFF" },
        }}
      >
        <LogoutIcon />
      </IconButton>

      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          color: "#000",
          marginBottom: 3
        }}
      >
        User Management
      </Typography>

      <Button 
        variant="contained" 
        onClick={handleSaveRoles} // Save roles when clicked
        sx={{
          backgroundColor: "#007AFF",
          boxShadow: "none", // Remove drop shadow
          "&:hover": {
            backgroundColor: "#007AFF",
            boxShadow: "none", // Ensure no shadow on hover
          },
          marginBottom: 6,
          borderRadius: 12, // Rounded corners for the button
          padding: '10px 20px', // Maintain the same padding as before
        }}
      >
        Save Roles
      </Button>

      <Box sx={{ display: 'flex', flexDirection: 'column', marginBottom: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: 1 }}>
          <Box sx={{ flex: '40%', textAlign: 'left' }}>User</Box> {/* Adjusted flex value for smaller width */}
          <Box sx={{ flex: '20%', textAlign: 'center' }}>Delete</Box>
          <Box sx={{ flex: '40%', textAlign: 'center' }}>Role</Box> {/* Left align the Role header */}
        </Box>
        {users.map((user) => (
          <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
            <Box sx={{ flex: '40%', textAlign: 'left', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </Box>
            <Box sx={{ flex: '20%', textAlign: 'center' }}>
              <IconButton 
                onClick={() => handleDeleteClick(user)} 
                sx={{ 
                  backgroundColor: "transparent", // Make background transparent
                  borderRadius: "50%", // Ensure circular shape
                  width: 48, // Set width
                  height: 48, // Set height
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
            <Box sx={{ flex: '40%', textAlign: 'center' }}>
              <FormControl sx={{ minWidth: '100px' }}> {/* Set a smaller width for the FormControl */}
                <Select
                  value={user.role} // Set the current role as the selected value
                  onChange={(e) => handleRoleChange(user.id, e.target.value)} // Update role on selection
                  displayEmpty
                  sx={{
                    minWidth: '100px', // Set a smaller minimum width for the dropdown
                    height: '36px', // Set a smaller height for the dropdown
                    padding: '0 10px', // Adjust padding to make it more compact
                    textAlign: 'center', // Center the text in the dropdown
                    backgroundColor: "rgba(118, 118, 128, 0.12)",
                    borderRadius: 12, // Rounded corners
                    "& .MuiOutlinedInput-root": { 
                      borderRadius: 12,
                    },
                  }}
                >
                  <MenuItem value="tallier">Tallier</MenuItem>
                  <MenuItem value="accountant">Accountant</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        ))}
      </Box>

      <UserDeleteModal 
        open={openDeleteModal} 
        onClose={() => setOpenDeleteModal(false)} 
        onConfirm={handleConfirmDelete} 
        user={userToDelete} 
      />

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

export default UserManagement;