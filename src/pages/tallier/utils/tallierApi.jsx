import API_URL from "../../../config/config";

// Fetch all tallies for a user
export const fetchUserTallies = async (userEmail) => {
    try {
        const response = await fetch(`${API_URL}/api/records/${userEmail}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching tallies:", error);
        throw new Error(error.message || 'Failed to fetch tallies');
    }
};

// Delete a tally record
export const deleteTallyRecord = async (tallyId, submittedBy) => {
    try {
        const response = await fetch(`${API_URL}/api/records/${tallyId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ submittedBy })
        });

        if (!response.ok) {
            throw new Error('Failed to delete tally');
        }
    } catch (error) {
        console.error("Error deleting tally:", error);
        throw new Error(error.message || 'Failed to delete tally');
    }
};

// Submit new tally data
export const submitTallyData = async (dateKey, bin, data) => {
    try {
        const response = await fetch(`${API_URL}/api/tally/${dateKey}_${bin}_${data.condition}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Error response:", errorBody);
            throw new Error('Network response was not ok');
        }

        return response.json();
    } catch (error) {
        console.error("Error submitting data:", error);
        throw new Error(error.message || 'Failed to submit tally data');
    }
};

// Update existing tally
export const updateTally = async (dateKey, binId, condition, data) => {
    try {
        const response = await fetch(`${API_URL}/api/tally/${dateKey}_${binId}_${condition}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error('Failed to save the tally');
        }

        return response.json();
    } catch (error) {
        console.error("Error saving tally:", error);
        throw new Error(error.message || 'Failed to update tally');
    }
};

// Delete manual price
export const deleteManualPrice = async (priceKey, submittedBy) => {
    try {
        const response = await fetch(`${API_URL}/api/tally/manual-prices/${priceKey}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ submittedBy })
        });

        if (!response.ok) {
            throw new Error('Failed to delete the manual price');
        }

        return response.json();
    } catch (error) {
        console.error("Error deleting manual price:", error);
        throw new Error(error.message || 'Failed to delete manual price');
    }
};

// Fetch tally data for editing
export const fetchTallyData = async (date, binId, condition) => {
    try {
        // Validate inputs
        if (!date || !binId || !condition) {
            throw new Error('Invalid date, bin ID, or condition provided');
        }

        // Log the request details
        console.log('Fetching tally with:', {
            date,
            binId,
            condition,
            url: `${API_URL}/api/tally/${date}_${binId}_${condition}`
        });

        // Update the endpoint format to match how data is stored (date_binId_condition)
        const response = await fetch(`${API_URL}/api/tally/${date}_${binId}_${condition}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                console.log('Response details:', {
                    status: response.status,
                    statusText: response.statusText
                });
                throw new Error('Tally not found');
            }
            throw new Error('Failed to fetch tally data');
        }
        return response.json();
    } catch (error) {
        console.error("Error fetching tally data:", error);
        throw new Error(error.message || 'Failed to fetch tally data');
    }
}; 