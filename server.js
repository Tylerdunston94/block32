// server.js

// IMPORT necessary modules:
const express = require('express');     // Import express for creating the server
const bodyParser = require('body-parser'); // Import body-parser to parse JSON requests
const cors = require('cors');           // Import cors for handling cross-origin requests
const { db, initializeDatabase } = require('./database'); // Import database functions

// INITIALIZE express application:
const app = express();                  // Create an instance of an Express application
const PORT = process.env.PORT || 3000; // Define the port to listen 

// USE middleware for CORS and JSON parsing:
app.use(cors());                        // Enable CORS
app.use(bodyParser.json());             // JSON requests

// INITIALIZE the database:
initializeDatabase();                   // Call to initialize the database

// DEFINE API ROUTES:

// DEFINE GET /api/flavors:
app.get('/api/flavors', (req, res) => {
    // QUERY all flavors from the database
    db.all("SELECT * FROM flavors", [], (err, rows) => {
        if (err) {
            // IF error occurs, SEND error response with status 500
            res.status(500).json({ error: err.message });
            return;
        }
        // ELSE, SEND response with the array of flavors
        res.json(rows);
    });
});

// DEFINE GET /api/flavors/:id:
app.get('/api/flavors/:id', (req, res) => {
    const { id } = req.params; // Get the flavor ID from request parameters
    
    // QUERY single flavor by ID from the database
    db.get("SELECT * FROM flavors WHERE id = ?", [id], (err, row) => {
        if (err) {
            // IF error occurs, SEND error response with status 500
            res.status(500).json({ error: err.message });
            return;
        }
        // ELSE, SEND response with the requested flavor
        res.json(row);
    });
});

// DEFINE POST /api/flavors:
app.post('/api/flavors', (req, res) => {
    const { name, is_favorite } = req.body; // Get new flavor data from the request body
    
    // INSERT new flavor into the database
    db.run("INSERT INTO flavors (name, is_favorite) VALUES (?, ?)", [name, is_favorite], function(err) {
        if (err) {
            // IF error occurs, SEND error response with status 500
            res.status(500).json({ error: err.message });
            return;
        }
        // QUERY the newly created flavor by last inserted ID
        db.get("SELECT * FROM flavors WHERE id = ?", [this.lastID], (err, row) => {
            // SEND response with the created flavor
            res.status(201).json(row);
        });
    });
});

// DEFINE DELETE /api/flavors/:id:
app.delete('/api/flavors/:id', (req, res) => {
    const { id } = req.params; // Get the flavor ID from request parameters
    
    // DELETE flavor by ID from the database
    db.run("DELETE FROM flavors WHERE id = ?", [id], function(err) {
        if (err) {
            // IF error occurs, SEND error response with status 500
            res.status(500).json({ error: err.message });
            return;
        }
        // SEND response with status 204 
        res.sendStatus(204);
    });
});

// DEFINE PUT /api/flavors/:id:
app.put('/api/flavors/:id', (req, res) => {
    const { id } = req.params; // Get the flavor ID from request parameters
    const { name, is_favorite } = req.body; // Get updated flavor data from request body
    const updated_at = new Date().toISOString(); // Get new timestamp for update

    // UPDATE flavor in the database with new data and update timestamp
    db.run("UPDATE flavors SET name = ?, is_favorite = ?, updated_at = ? WHERE id = ?", [name, is_favorite, updated_at, id], function(err) {
        if (err) {
            // IF error occurs, SEND error  with status 500
            res.status(500).json({ error: err.message });
            return;
        }
        // QUERY the updated flavor by ID
        db.get("SELECT * FROM flavors WHERE id = ?", [id], (err, row) => {
            // SEND response with the updated flavor
            res.json(row);
        });
    });
});

// START the server :
app.listen(PORT, () => {
    // LOG a message, server is running
    console.log(`Server is running on http://localhost:${PORT}`);
});

