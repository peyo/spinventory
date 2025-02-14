import axios from "axios";
import API_URL from "../../../config/config"; // Import the API URL
import { auth } from "../../../config/firebase"; // Ensure this path is correct

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
        if (!user) {
            throw new Error('No user is currently logged in');
        }

        const response = await axios.get(`${API_URL}/api/user/date-range`, {
            params: {
                startDate: startDate,
                endDate: endDate,
                userEmail: user.email
            }
        });

        return response.data;
    } catch (error) {
        console.error("Error fetching tallies:", error);
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error("Server Error Data:", error.response.data);
            console.error("Server Error Status:", error.response.status);
            throw new Error(error.response.data.message || 'Failed to fetch tallies');
        } else if (error.request) {
            // The request was made but no response was received
            throw new Error('No response received from server');
        } else {
            // Something happened in setting up the request that triggered an Error
            throw new Error(error.message || 'Error setting up the request');
        }
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