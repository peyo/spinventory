import axios from "axios";
import API_URL from "../config/config"; // Import the API URL

// Fetch all users
export const fetchUsers = async () => {
  const response = await axios.get(`${API_URL}/api/user`); // Use the base URL with /api/
  return response.data; // Assuming the response data is an array of users
};

// Delete a user by ID
export const deleteUser = async (userId) => {
  await axios.delete(`${API_URL}/api/user/${userId}`); // Use the base URL with /api/
};

// Update a user's role
export const updateUserRole = async (userId, updatedUser) => {
  await axios.put(`${API_URL}/api/user/${userId}`, updatedUser); // Use the base URL with /api/
};

// Fetch tallies by date range
export const fetchTalliesByDate = async (startDate, endDate) => {
  const response = await axios.get(`${API_URL}/api/user/bins`, {
    params: {
      startDate: startDate,
      endDate: endDate
    }
  }); // Adjust the endpoint as necessary
  return response.data; // Assuming the response data is an array of tallies
};

// DELETE endpoint to remove a bin count by ID
export const deleteBinCount = async (tallyKey) => {
  const response = await axios.delete(`${API_URL}/api/user/bins/${tallyKey}`); // Use Axios to send a DELETE request

  if (response.status !== 200) {
    throw new Error('Failed to delete bin count');
  }
};