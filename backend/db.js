const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Glitch.com uses .data/ folder for persistent storage.
// We check if we are on Glitch, otherwise use local folder.
const isGlitch = process.env.PROJECT_DOMAIN !== undefined;
const dbDir = isGlitch ? path.resolve(__dirname, '../.data') : __dirname;

if (isGlitch && !fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(dbDir, 'database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log(`Connected to the SQLite database at ${dbPath}`);
  }
});

module.exports = db;
