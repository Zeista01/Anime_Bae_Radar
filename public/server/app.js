const port = 3000;
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://animebaeradar.freewebhostmost.com');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    charset: "latin1",
    connectionLimit: 10,
    socketPath: process.env.DB_SOCKET_PATH
});

pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('MySQL Connected...');
    connection.release();
});

app.post('/findMatch', (req, res) => {
    const preferences = req.body;

     const query = `
        SELECT *, (
            (LOWER(confession) = LOWER(?) AND 1 OR 0) +
            (LOWER(first_date) = LOWER(?) AND 1 OR 0) +
            (LOWER(most_loved) = LOWER(?) AND 1 OR 0) +
            (LOWER(turn_off) = LOWER(?) AND 1 OR 0) +
            (LOWER(physique) = LOWER(?) AND 1 OR 0) +
            (LOWER(crime) = LOWER(?) AND 1 OR 0)
        ) AS match_score
        FROM characters
        ORDER BY match_score DESC
        LIMIT 1;
    `;

    const values = [
        preferences.confession,
        preferences.first_date,
        preferences.most_loved,
        preferences.turn_off,
        preferences.physique,
        preferences.crime
    ];

    pool.query(query, values, (error, results) => {
        if (error) {
            res.status(500).json({ error });
            return;
        }
        res.json(results.length ? results[0] : { name: 'No match found' });
    });
});

app.listen(port, () => console.log(`App is running on port ${port}`));
