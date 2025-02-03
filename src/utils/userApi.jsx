import axios from "axios";
import API_URL from "../config/config"; // Import the API URL

// Fetch all users
export const fetchUsers = async () => {
  const response = await axios.get(`${API_URL}/api/users`); // Use the base URL with /api/
  return response.data; // Assuming the response data is an array of users
};

// Delete a user by ID
export const deleteUser = async (userId) => {
  await axios.delete(`${API_URL}/api/users/${userId}`); // Use the base URL with /api/
};

// Update a user's role
export const updateUserRole = async (userId, updatedUser) => {
  await axios.put(`${API_URL}/api/users/${userId}`, updatedUser); // Use the base URL with /api/
};
