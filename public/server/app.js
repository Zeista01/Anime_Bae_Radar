const port = 3000;
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
require('dotenv').config();

import { inject } from '@vercel/analytics';
 
inject();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Check database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL');
        release();
    }
});

// Endpoint to find a match
app.post('/findMatch', async (req, res) => {
    const preferences = req.body;

    const query = `
        SELECT *, (
            (LOWER(confession) = LOWER($1)::TEXT)::INTEGER +
            (LOWER(first_date) = LOWER($2)::TEXT)::INTEGER +
            (LOWER(most_loved) = LOWER($3)::TEXT)::INTEGER +
            (LOWER(turn_off) = LOWER($4)::TEXT)::INTEGER +
            (LOWER(physique) = LOWER($5)::TEXT)::INTEGER +
            (LOWER(crime) = LOWER($6)::TEXT)::INTEGER
        ) AS match_score
        FROM characters
        ORDER BY match_score DESC
        LIMIT 1;
    `;

    const values = [
        preferences.confession || '',
        preferences.first_date || '',
        preferences.most_loved || '',
        preferences.turn_off || '',
        preferences.physique || '',
        preferences.crime || ''
    ];

    try {
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.json({ name: 'No match found' });
        }
    } catch (error) {
        console.error('Database query error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => console.log(`App is running on port ${port}`));
