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

// POST endpoint to save tally data
app.post('/bins/:binId/tallies/:date', async (req, res) => {
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
app.delete('/manual-prices/:priceId', async (req, res) => {
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

// GET endpoint to retrieve tallies for a specific user
app.get('/tallies/:email', async (req, res) => {
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

// PUT endpoint to update a tally
app.put('/tallies/:date/:condition', async (req, res) => {
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
app.get('/tallies/:date/:condition', async (req, res) => {
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});