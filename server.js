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
    const { condition, counter, tallier, submittedBy, tallies } = req.body; // Ensure you have the correct fields
    const { binId, date } = req.params;

    // Validate the incoming data
    if (!binId || !condition || !counter || !tallier || !submittedBy || !tallies) {
        return res.status(400).send("All fields are required");
    }

    const tallyKey = `${date}_${condition}`; // Keep the same key format

    try {
        const newTallyRef = admin.database().ref(`tallies/${tallyKey}`); // Save directly under tallies
        await newTallyRef.set({
            binId,
            condition,
            counter,
            createdAt: Math.floor(new Date().getTime() / 1000), // Store createdAt as Unix timestamp
            submittedBy,
            tallier,
            tallies,
        });

        res.status(201).send({ message: 'Tally data saved successfully' });
    } catch (error) {
        console.error("Error saving tally data:", error);
        res.status(500).send("Error saving tally data");
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});