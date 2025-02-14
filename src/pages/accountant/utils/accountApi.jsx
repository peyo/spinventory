import API_URL from "../../../config/config";

// Fetch data for CSV generation
export const fetchAccountingData = async (startDate, endDate) => {
    try {
        const response = await fetch(`${API_URL}/api/data?startDate=${startDate}&endDate=${endDate}`);
        if (!response.ok) {
            throw new Error('Failed to fetch accounting data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching accounting data:", error);
        throw new Error(error.message || 'Failed to fetch accounting data');
    }
};

// Send email with CSV attachment
export const sendCSVEmail = async (email, csvContent) => {
    try {
        const response = await fetch(`${API_URL}/api/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, csvContent }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error('Failed to send email');
        }

        return response.json();
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error(error.message || 'Failed to send email');
    }
}; 