import { onRequest } from 'firebase-functions/v2/https';
import express from 'express';
import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

const app = express();

// Initialize Firebase Admin
admin.initializeApp();

// Add express.json() before CORS middleware
app.use(express.json());

// Update CORS middleware with more headers
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true'
    });

    if (req.method === 'OPTIONS') {
        return res.status(204).send('');
    }
    return next();
});

// POST endpoint to create a new user
app.post('/api/users', async (req, res) => {
    const { uid, email } = req.body; // Get user data from the request body

    try {
        // Store user data in the database
        await admin.database().ref('users/' + uid).set({
            email: email,
            role: "tallier" // Default role if not provided
        });

        res.status(201).send({ message: "User data stored successfully." });
    } catch (error) {
        console.error("Error storing user data:", error);
        res.status(500).send("Error storing user data");
    }
});

// POST endpoint to save tally data
app.post('/api/tally/:binId/tallies/:date', async (req, res) => {
    const { condition, counter, tallier, submittedBy, tallies, manualPrices, createdAt } = req.body; // Ensure you have the correct fields
    const { binId, date } = req.params;

    // Validate the incoming data
    if (!binId || !condition || !counter || !tallier || !submittedBy || !tallies || !createdAt) {
        return res.status(400).send("All fields are required");
    }

    const tallyKey = `${date}_${condition}`; // Keep the same key format

    try {
        const newTallyRef = admin.database().ref(`tallies/${tallyKey}`); // Save directly under tallies
        await newTallyRef.set({
            binId,
            condition,
            counter,
            createdAt, // Use createdAt from the request body
            submittedBy,
            tallier,
            tallies,
            manualPrices: manualPrices || [], // Save manual prices
        });

        res.status(201).send({ message: 'Tally data saved successfully' });
    } catch (error) {
        console.error("Error saving tally data:", error);
        res.status(500).send("Error saving tally data");
    }
});

// DELETE endpoint to remove a manual price
app.delete('/api/tally/manual-prices/:priceId', async (req, res) => {
    const priceId = req.params.priceId;
    const userEmail = req.body.submittedBy; // Get the user's email

    try {
        const priceRef = admin.database().ref(`manualPrices/${priceId}`);
        const snapshot = await priceRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Manual price not found' });
        }

        const priceData = snapshot.val();
        if (priceData.submittedBy !== userEmail) {
            return res.status(403).json({ message: 'You are not authorized to delete this manual price' });
        }

        await priceRef.remove();
        res.status(200).json({ message: 'Manual price deleted successfully' });
    } catch (error) {
        console.error("Error deleting manual price:", error);
        res.status(500).json({ message: 'Error deleting manual price' });
    }
});

// PUT endpoint to update a tally
app.put('/api/tally/:date/:condition', async (req, res) => {
    const { date, condition } = req.params;
    const tallyKey = `${date}_${condition}`;
    const updatedTally = req.body;
    const userEmail = req.body.submittedBy; // Get the user's email

    try {
        const tallyRef = admin.database().ref(`tallies/${tallyKey}`);
        const snapshot = await tallyRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Tally not found' });
        }

        const tallyData = snapshot.val();
        // Check if user is authorized to update
        if (tallyData.submittedBy !== userEmail) {
            return res.status(403).json({ message: 'You are not authorized to update this tally' });
        }

        await tallyRef.update(updatedTally);
        res.status(200).json({ message: 'Tally updated successfully', tally: updatedTally });
    } catch (error) {
        console.error("Error updating tally:", error);
        res.status(500).json({ message: 'Error updating tally' });
    }
});

// GET endpoint to retrieve a specific tally by date and condition for editing
app.get('/api/tally/:date/:condition', async (req, res) => {
    const { date, condition } = req.params; // Get the date and condition from the URL
    const tallyKey = `${date}_${condition}`; // Construct the tallyKey
    console.log("Fetching tally with key:", tallyKey); // Debugging log

    try {
        const tallyRef = admin.database().ref(`tallies/${tallyKey}`);
        const snapshot = await tallyRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Tally not found' });
        }

        // Send the tally data back to the client
        res.status(200).json(snapshot.val());
    } catch (error) {
        console.error("Error retrieving tally:", error);
        res.status(500).json({ message: 'Error retrieving tally' });
    }
});

// DELETE endpoint to remove a tally by ID
app.delete('/api/records/:id', async (req, res) => {  // Changed from /api/bin/tallies/:id
    const { id } = req.params;
    const userEmail = req.body.submittedBy;

    try {
        const tallyRef = admin.database().ref(`tallies/${id}`);
        const snapshot = await tallyRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Tally not found' });
        }

        const tallyData = snapshot.val();
        if (tallyData.submittedBy !== userEmail) {
            return res.status(403).json({ message: 'You are not authorized to delete this tally' });
        }

        await tallyRef.remove();
        res.status(200).json({ message: 'Tally deleted successfully' });
    } catch (error) {
        console.error("Error deleting tally:", error);
        res.status(500).json({ message: 'Error deleting tally' });
    }
});

// GET endpoint to retrieve tallies for a specific user
app.get('/api/records/:email', async (req, res) => {
    const { email } = req.params;
    console.log("Fetching tallies for email:", email);

    try {
        const talliesRef = admin.database().ref('tallies').orderByChild('submittedBy').equalTo(email);
        const snapshot = await talliesRef.once('value');
        
        // Always return 200 with data or empty object
        res.status(200).json(snapshot.val() || {});
    } catch (error) {
        console.error("Error retrieving tallies:", error);
        res.status(500).send("Error retrieving tallies");
    }
});

// GET endpoint to retrieve all users
app.get('/api/user', async (req, res) => {
    try {
        const usersRef = admin.database().ref('users'); // Adjust the path as necessary
        const snapshot = await usersRef.once('value');
        const data = snapshot.val();

        if (data) {
            res.status(200).send(data); // Send the user data back to the client
        } else {
            res.status(404).send("No users found.");
        }
    } catch (error) {
        console.error("Error retrieving users:", error);
        res.status(500).send("Error retrieving users");
    }
});

// GET endpoint to fetch data based on start and end dates
app.get('/api/user/date-range', async (req, res) => {
    const { startDate, endDate } = req.query;
    const userEmail = req.query.userEmail; // Add this parameter from frontend

    try {
        // Check user role
        const userRef = admin.database().ref(`users/${userEmail}`);
        const userSnapshot = await userRef.once('value');
        
        if (!userSnapshot.exists()) {
            return res.status(403).json({ message: 'User not found' });
        }

        const userRole = userSnapshot.val().role;
        if (userRole !== 'admin' && userRole !== 'accountant') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const start = parseInt(startDate);
        const end = parseInt(endDate);

        const dataRef = admin.database().ref('tallies');
        const snapshot = await dataRef
            .orderByChild('createdAt')
            .startAt(start)
            .endAt(end)
            .once('value');
        
        const data = snapshot.val();
        res.status(200).json(data || {});
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
    }
});

// GET endpoint to fetch user role by user ID
app.get('/api/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const requestingUserEmail = req.query.requestingUser;

    console.log('Fetching role for:', userId, 'requested by:', requestingUserEmail);

    try {
        // First verify the requesting user exists in Auth
        const requestingUserRecord = await admin.auth().getUserByEmail(requestingUserEmail);
        if (!requestingUserRecord) {
            console.log('Requesting user not found in Auth:', requestingUserEmail);
            return res.status(403).json({ error: 'User not found' });
        }

        // Get the requesting user's role from Realtime Database
        const requestingUserRef = admin.database().ref(`users/${requestingUserRecord.uid}`);
        const requestingUserSnapshot = await requestingUserRef.once('value');
        const requestingUserData = requestingUserSnapshot.val();

        if (!requestingUserData) {
            return res.status(403).json({ error: 'User not found in database' });
        }

        // If user is requesting their own role, allow it
        if (requestingUserRecord.uid === userId) {
            return res.status(200).json({ role: requestingUserData.role });
        }

        // If requesting another user's role, check if requester is admin
        if (requestingUserData.role !== 'admin') {
            console.log('User not admin:', requestingUserEmail, requestingUserData.role);
            return res.status(403).json({ error: 'Only admins can view other users\' roles' });
        }

        // Get the target user's role
        const targetUserRef = admin.database().ref(`users/${userId}`);
        const targetSnapshot = await targetUserRef.once('value');

        if (targetSnapshot.exists()) {
            const userData = targetSnapshot.val();
            console.log('Target user data found:', userData);
            res.status(200).json({ role: userData.role });
        } else {
            console.warn(`User not found for ID: ${userId}`);
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error("Detailed error fetching user role:", error);
        if (error.code === 'auth/user-not-found') {
            return res.status(403).json({ error: 'User not found' });
        }
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// DELETE endpoint to remove a user by ID
app.delete('/api/user/:userId', async (req, res) => {
    const { userId } = req.params; // Get the user ID from the URL

    try {
        const userRef = admin.database().ref(`users/${userId}`); // Reference to the user in the database
        await userRef.remove(); // Remove the user from the database

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// PUT endpoint to update a user's role
app.put('/api/user/:userId', async (req, res) => {
    const { userId } = req.params; // Get the user ID from the URL
    const { role } = req.body; // Get the new role from the request body

    try {
        const userRef = admin.database().ref(`users/${userId}`); // Reference to the user in the database
        await userRef.update({ role }); // Update the user's role

        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: 'Error updating user role' });
    }
});

// DELETE endpoint to remove a bin count by ID
app.delete('/api/tallies/:tallyKey', async (req, res) => {
    const { tallyKey } = req.params;
    const { submittedBy } = req.body;

    console.log("Received request to delete tally with key:", tallyKey);

    try {
        // First check if the tally exists
        const tallyRef = admin.database().ref(`tallies/${tallyKey}`);
        const snapshot = await tallyRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Tally not found' });
        }

        const tallyData = snapshot.val();

        // Check if the submitter matches
        if (tallyData.submittedBy !== submittedBy) {
            return res.status(403).json({ 
                message: 'You are not authorized to delete this tally' 
            });
        }

        // If we get here, the user is authorized to delete
        await tallyRef.remove();
        console.log(`Successfully deleted tally with key: ${tallyKey}`);

        res.status(200).json({ message: 'Bin count deleted successfully' });
    } catch (error) {
        console.error("Error deleting bin count:", error);
        res.status(500).json({ message: 'Error deleting bin count' });
    }
});

// POST endpoint to send CSV email
app.post('/api/send-email', async (req, res) => {
    const { email, csvContent } = req.body; // Get email and CSV content from the request body

    // Set up nodemailer transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or your email service
        auth: {
            user: 'peteryyoon@gmail.com',  // Hardcode for now
            pass: 'ojpf idvk svvd reos',   // Hardcode for now
        },
    });

    // Send email with CSV attachment
    const mailOptions = {
        from: 'peteryyoon@gmail.com',  // Hardcode for now
        to: email, // recipient email
        subject: 'CSV Data',
        text: 'Please find the attached CSV data.',
        attachments: [
            {
                filename: 'data.csv',
                content: csvContent, // Use the CSV content passed from the frontend
            },
        ],
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).send({ message: 'Failed to send email.' });
    }
});

// GET endpoint to fetch data based on start and end dates
app.get('/api/data', async (req, res) => {
    console.log("Received request for data with:", req.query); // Log the query parameters
    const { startDate, endDate } = req.query; // Get startDate and endDate from query parameters

    try {
        // Convert the timestamps back to integers
        const start = parseInt(startDate);
        const end = parseInt(endDate);

        // Query your database to fetch data between the two timestamps
        const dataRef = admin.database().ref('tallies'); // Adjusted path to your data
        const snapshot = await dataRef.orderByChild('createdAt').startAt(start).endAt(end).once('value');
        const data = snapshot.val();

        if (data) {
            res.status(200).json(data); // Send the data back to the client
        } else {
            res.status(404).send("No data found for the specified date range.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(500).send("Error fetching data");
    }
});

// Export the api to Firebase Cloud Functions
export const api = onRequest({
    cors: [/localhost/, /\.web\.app$/],
    maxInstances: 10
}, app);