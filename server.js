// server.js

// Import the necessary modules:
const express = require('express');      // For creating the server
const bodyParser = require('body-parser'); // To parse incoming JSON requests
const cors = require('cors');            // To allow requests from different origins
const { db, initializeDatabase } = require('./database'); // Your database functions

// Create an Express application:
const app = express();                   // Create an instance of an Express app
const PORT = process.env.PORT || 3000;   // Set the port to listen on

// Use middleware:
app.use(cors());                         // Enable CORS for all routes
app.use(bodyParser.json());              // Parse JSON bodies

// Initialize the database:
initializeDatabase();                    // Call function to set up the database

// Define API routes:

// 1. Get all flavors
app.get('/api/flavors', (req, res) => {
    // Query to get all flavors from the database
    db.all("SELECT * FROM flavors", [], (err, flavors) => {
        if (err) {
            // If there's an error, return a 500 status and the error message
            res.status(500).json({ error: err.message });
            return;
        }
        // If successful, return the flavors
        res.json(flavors);
    });
});

// 2. Get a single flavor by ID
app.get('/api/flavors/:id', (req, res) => {
    const flavorId = req.params.id; // Get the flavor ID from the request URL
    
    // Query to get a single flavor by its ID
    db.get("SELECT * FROM flavors WHERE id = ?", [flavorId], (err, flavor) => {
        if (err) {
            // If there's an error, return a 500 status and the error message
            res.status(500).json({ error: err.message });
            return;
        }
        // If successful, return the flavor
        res.json(flavor);
    });
});

// 3. Add a new flavor
app.post('/api/flavors', (req, res) => {
    const name = req.body.name; // Get the flavor name from the request body
    const isFavorite = req.body.is_favorite; // Get favorite status

    // Insert the new flavor into the database
    db.run("INSERT INTO flavors (name, is_favorite) VALUES (?, ?)", [name, isFavorite], function(err) {
        if (err) {
            // If there's an error, return a 500 status and the error message
            res.status(500).json({ error: err.message });
            return;
        }
        // Query to get the newly created flavor
        db.get("SELECT * FROM flavors WHERE id = ?", [this.lastID], (err, newFlavor) => {
            // Respond with the created flavor and a 201 status
            res.status(201).json(newFlavor);
        });
    });
});

// 4. Delete a flavor by ID
app.delete('/api/flavors/:id', (req, res) => {
    const flavorId = req.params.id; // Get the flavor ID from the request URL
    
    // Delete the flavor from the database by ID
    db.run("DELETE FROM flavors WHERE id = ?", [flavorId], function(err) {
        if (err) {
            // If there's an error, return a 500 status and the error message
            res.status(500).json({ error: err.message });
            return;
        }
        // Respond with a 204 status (no content)
        res.sendStatus(204);
    });
});

// 5. Update a flavor by ID
app.put('/api/flavors/:id', (req, res) => {
    const flavorId = req.params.id; // Get the flavor ID
    const name = req.body.name; // Get updated flavor name
    const isFavorite = req.body.is_favorite; // Get updated favorite status
    const updatedAt = new Date().toISOString(); // Get current timestamp

    // Update the flavor in the database with new values
    db.run("UPDATE flavors SET name = ?, is_favorite = ?, updated_at = ? WHERE id = ?", [name, isFavorite, updatedAt, flavorId], function(err) {
        if (err) {
            // If there's an error, return a 500 status and the error message
            res.status(500).json({ error: err.message });
            return;
        }
        // Query for the updated flavor to return it
        db.get("SELECT * FROM flavors WHERE id = ?", [flavorId], (err, updatedFlavor) => {
            // Respond with the updated flavor
            res.json(updatedFlavor);
        });
    });
});

// Start the server:
app.listen(PORT, () => {
    // Log a message to the console when the server is running
    console.log(`Server is running on http://localhost:${PORT}`);
});
