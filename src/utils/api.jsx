import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // Adjust the URL as needed

// Fetch all users
export const fetchUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

// Delete a user by ID
export const deleteUser = async (userId) => {
  await axios.delete(`${API_URL}/users/${userId}`);
};

// Update a user's role
export const updateUserRole = async (userId, updatedUser) => {
  await axios.put(`${API_URL}/users/${userId}/role`, updatedUser);
};