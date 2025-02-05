import { useEffect, useState } from "react";
import { Button, Typography, Container, IconButton, Box, Select, MenuItem, FormControl, Snackbar } from "@mui/material";
import UserDeleteModal from "../../components/Modals/UserDeleteModal";
import { fetchUsers, deleteUser, updateUserRole } from "../../utils/managerApi"; // Import your API functions
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import back icon
import DeleteIcon from "@mui/icons-material/Delete"; // Import trash can icon
import LogoutIcon from "@mui/icons-material/Logout"; // Import logout icon
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import { auth } from "../../config/firebase"; // Ensure this path is correct

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
    const currentUser = auth.currentUser;
    if (!currentUser) {
        setSnackbarMessage("No user is currently logged in");
        setSnackbarOpen(true);
        return;
    }

    try {
        await deleteUser(userToDelete.id, currentUser.email); // Pass the current user's email
        setUsers(users.filter((user) => user.id !== userToDelete.id));
        setOpenDeleteModal(false);
        setSnackbarMessage("User deleted successfully");
        setSnackbarOpen(true);
    } catch (error) {
        console.error("Error deleting user:", error);
        setSnackbarMessage(error.message || "Failed to delete user"); // Use error message from backend if available
        setSnackbarOpen(true);
    }
  };

// Modify handleRoleChange to only update local state
const handleRoleChange = (userId, newRole) => {
  // Only update the local state without making API calls
  const updatedUsers = users.map((user) => {
      if (user.id === userId) {
          return { ...user, role: newRole };
      }
      return user;
  });
  setUsers(updatedUsers);
};

// Update handleSaveRoles to handle all role updates
const handleSaveRoles = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
      setSnackbarMessage("No user is currently logged in");
      setSnackbarOpen(true);
      return;
  }

  try {
      // Save all role updates at once
      await Promise.all(users.map(user => 
          updateUserRole(user.id, {
              role: user.role,
              requestingUser: currentUser.email
          })
      ));
      
      setSnackbarMessage("User roles saved successfully!");
      setSnackbarOpen(true);
  } catch (error) {
      console.error("Error saving user roles:", error);
      setSnackbarMessage("Failed to save user roles: " + error.message);
      setSnackbarOpen(true);

      // Refresh the user list to revert to the server state
      try {
          const fetchedUsers = await fetchUsers();
          if (fetchedUsers && typeof fetchedUsers === 'object') {
              const userArray = Object.keys(fetchedUsers).map(key => ({
                  id: key,
                  ...fetchedUsers[key]
              }));
              setUsers(userArray);
          }
      } catch (fetchError) {
          console.error("Error fetching users:", fetchError);
          setSnackbarMessage("Failed to revert changes. Please refresh the page.");
          setSnackbarOpen(true);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login page after logout
    } catch (error) {
      setSnackbarMessage("Logout failed: " + error.message);
      setSnackbarOpen(true); // Open Snackbar
    }
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

      {snackbarOpen && (
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      )}

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
              <FormControl sx={{ width: '110px' }}> {/* Set a smaller width for the FormControl */}
              <Select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  displayEmpty
                  sx={{
                      height: '36px',
                      padding: '0 10px',
                      textAlign: 'center',
                      backgroundColor: "rgba(118, 118, 128, 0.12)",
                      borderRadius: 12,
                      "& .MuiOutlinedInput-root": { 
                          borderRadius: 12,
                      },
                      "& .MuiSelect-select": {  // Add styles for the selected text
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          paddingRight: '24px' // Make room for the dropdown arrow
                      }
                  }}
              >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="accountant">Accountant</MenuItem>
                  <MenuItem value="tallier">Tallier</MenuItem>
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
    </Container>
  );
};

export default UserManagement;