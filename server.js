import express from 'express';
import admin from 'firebase-admin';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Adjust this to your React app's URL
}));

// Load service account key
const __dirname = path.dirname(new URL(import.meta.url).pathname); // Get the directory name
const serviceAccountPath = path.join(__dirname, 'config', 'serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), // Use the service account credentials
  databaseURL: "https://spinventory-25db0-default-rtdb.firebaseio.com/"
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

// GET endpoint to fetch user role by user ID
app.get('/api/user-role/:userId', async (req, res) => {
    const { userId } = req.params; // Get user ID from request parameters
    console.log(`Fetching role for user ID: ${userId}`); // Log the user ID

    try {
        const userRef = admin.database().ref(`users/${userId}`); // Reference to the user document
        const snapshot = await userRef.once('value'); // Fetch the user document

        if (snapshot.exists()) {
            const userData = snapshot.val();
            res.status(200).json({ role: userData.role }); // Return the user's role
        } else {
            console.warn(`User not found for ID: ${userId}`); // Log warning if user not found
            res.status(404).json({ error: 'User not found' }); // Handle case where user does not exist
        }
    } catch (error) {
        console.error("Error fetching user role:", error);
        res.status(500).json({ error: 'Internal server error' }); // Handle server errors
    }
});

// POST endpoint to save tally data
app.post('/api/tally/bins/:binId/tallies/:date', async (req, res) => {
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
    const priceId = req.params.priceId; // Get the price ID from the URL

    try {
        const priceRef = admin.database().ref(`manualPrices/${priceId}`); // Reference to the manual price in the database
        await priceRef.remove(); // Remove the price from the database

        res.status(200).json({ message: 'Manual price deleted successfully' });
    } catch (error) {
        console.error("Error deleting manual price:", error);
        res.status(500).json({ message: 'Error deleting manual price' });
    }
});

// PUT endpoint to update a tally
app.put('/api/tally/tallies/:date/:condition', async (req, res) => {
    const { date, condition } = req.params; // Get the date and condition from the URL
    const tallyKey = `${date}_${condition}`; // Construct the tallyKey
    const updatedTally = req.body; // Get the updated tally data from the request body

    try {
        const tallyRef = admin.database().ref(`tallies/${tallyKey}`);
        const snapshot = await tallyRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ message: 'Tally not found' });
        }

        // Update the tally
        await tallyRef.update(updatedTally);

        // Send a success response
        res.status(200).json({ message: 'Tally updated successfully', tally: updatedTally });
    } catch (error) {
        console.error("Error updating tally:", error);
        res.status(500).json({ message: 'Error updating tally' });
    }
});

// GET endpoint to retrieve a specific tally by date and condition for editing
app.get('/api/tally/tallies/:date/:condition', async (req, res) => {
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

// GET endpoint to retrieve tallies for a specific user
app.get('/api/records/tallies/:email', async (req, res) => {
    const { email } = req.params;
    console.log("Fetching tallies for email:", email);

    try {
        const talliesRef = admin.database().ref('tallies').orderByChild('submittedBy').equalTo(email);
        const snapshot = await talliesRef.once('value');
        const data = snapshot.val();

        if (data) {
            res.status(200).send(data);
        } else {
            res.status(404).send("No tallies found for this user.");
        }
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

// Fetch tallies by date
app.get('/api/user/bins/:date', async (req, res) => {
    const { date } = req.params;
    console.log("Received date:", date); // Log the received date
    try {
        const talliesRef = admin.database().ref('tallies').orderByChild('createdAt').equalTo(parseInt(date)); // Ensure date is an integer
        const snapshot = await talliesRef.once('value');
        const tallies = snapshot.val();

        console.log("Fetched tallies:", tallies); // Log the fetched tallies

        if (tallies) {
            res.status(200).json(tallies); // Send the tallies back to the client
        } else {
            res.status(404).send("No tallies found for this date.");
        }
    } catch (error) {
        console.error("Error fetching tallies:", error);
        res.status(500).send("Error fetching tallies");
    }
});

// DELETE endpoint to remove a bin count by ID
app.delete('/api/user/bins/:tallyKey', async (req, res) => {
    const { tallyKey } = req.params; // Get the bin ID from the URL
    console.log("Received request to delete tally with key:", tallyKey); // Log the received tallyKey

    try {
        const binRef = admin.database().ref(`tallies/${tallyKey}`); // Reference to the bin in the database
        await binRef.remove(); // Remove the bin from the database
        console.log(`Successfully deleted tally with key: ${tallyKey}`); // Log success

        res.status(200).json({ message: 'Bin count deleted successfully' });
    } catch (error) {
        console.error("Error deleting bin count:", error);
        res.status(500).json({ message: 'Error deleting bin count' });
    }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});