const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const databasePath = path.join(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(databasePath, (error) => {
    if (error) {
        console.error('Erreur de connexion à SQLite :', error.message);
        return;
    }

    console.log('Connexion à SQLite réussie.');
});

db.run('PRAGMA foreign_keys = ON', (error) => {
    if (error) {
        console.error(
            'Impossible d’activer les clés étrangères :',
            error.message
        );
    }
});

module.exports = db;