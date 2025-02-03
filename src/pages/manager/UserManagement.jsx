import { useEffect, useState } from "react";
import { Button, Typography, Container, IconButton } from "@mui/material";
import UserDeleteModal from "../../components/Modals/UserDeleteModal";
import RoleAssignmentCheckbox from "../../components/UserManagement/RoleAssignmentCheckbox";
import { fetchUsers, deleteUser, updateUserRole } from "../../utils/api"; // Import your API functions
import ArrowBackIcon from "@mui/icons-material/ArrowBack"; // Import back icon
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    const getUsers = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
    };
    getUsers();
  }, []);

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    await deleteUser(userToDelete.id); // Assuming user has an id property
    setUsers(users.filter((user) => user.id !== userToDelete.id));
    setOpenDeleteModal(false);
  };

  const handleRoleChange = async (userId, role) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return { ...user, [role]: !user[role] }; // Toggle the role
      }
      return user;
    });
    setUsers(updatedUsers);
    await updateUserRole(userId, updatedUsers.find((user) => user.id === userId)); // Update role in the database
  };

  return (
    <Container sx={{ paddingTop: 4, textAlign: "center" }}>
      <IconButton 
        onClick={() => navigate("/")} // Navigate back to the previous page
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
        User Management
      </Typography>

      <Button 
        variant="contained" 
        onClick={() => {/* Logic to save roles if needed */}}
        sx={{
          backgroundColor: "#007AFF",
          boxShadow: "none", // Remove drop shadow
          "&:hover": {
            backgroundColor: "#007AFF",
            boxShadow: "none", // Ensure no shadow on hover
          }
        }}
      >
        Save Roles
      </Button>

      {users.map((user) => (
        <Container key={user.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span>{user.email}</span>
          <RoleAssignmentCheckbox user={user} onRoleChange={handleRoleChange} />
          <Button onClick={() => handleDeleteClick(user)}>Delete</Button>
        </Container>
      ))}
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