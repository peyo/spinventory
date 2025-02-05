import axios from "axios";
import API_URL from "../config/config"; // Import the API URL
import { auth } from "../config/firebase"; // Ensure this path is correct

// Fetch all users
export const fetchUsers = async () => {
  const response = await axios.get(`${API_URL}/api/user`); // Use the base URL with /api/
  return response.data; // Assuming the response data is an array of users
};

// Delete a user by ID
export const deleteUser = async (userId, requestingUserEmail) => {
  try {
      const response = await axios.delete(`${API_URL}/api/user/${userId}`, {
          data: { requestingUser: requestingUserEmail } // Pass the requesting user's email in the body
      });
      return response.data;
  } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

// Update a user's role
export const updateUserRole = async (userId, updatedUser) => {
  try {
      const response = await axios.put(`${API_URL}/api/user/${userId}`, updatedUser);
      return response.data;
  } catch (error) {
      console.error("Error updating user role:", error);
      throw new Error(error.response?.data?.message || 'Failed to update user role');
  }
};

// Fetch tallies by date range
export const fetchTalliesByDate = async (startDate, endDate) => {
  try {
      const user = auth.currentUser; // Get current user
      const response = await axios.get(`${API_URL}/api/user/date-range`, {
          params: {
              startDate: startDate,
              endDate: endDate,
              userEmail: user.email // Add user email for role check
          }
      });
      return response.data || {};
  } catch (error) {
      console.error("Error fetching tallies:", error);
      return {};
  }
};

// DELETE endpoint to remove a bin count by ID
export const deleteBinCount = async (tallyKey, submittedBy) => {
  const response = await axios.delete(`${API_URL}/api/tallies/${tallyKey}`, {
      data: { submittedBy } // Pass submittedBy in request body
  });

  if (response.status !== 200) {
      throw new Error('Failed to delete bin count');
  }
};