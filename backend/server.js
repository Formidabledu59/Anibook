const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Connexion à la base de données SQLite (crée un fichier database.sqlite dans le backend)
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Erreur de connexion à la bdd', err.message);
    } else {
        console.log('Connecté à la base de données SQLite.');
    }
});

// Création de la table characters si elle n'existe pas
db.run(`CREATE TABLE IF NOT EXISTS characters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    anime TEXT NOT NULL,
    description TEXT
)`);

// Route de test : Récupérer tous les personnages
app.get('/characters', (req, res) => {
    db.all(`SELECT * FROM characters`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ characters: rows });
    });
});

// Route de test : Ajouter un personnage
app.post('/characters', (req, res) => {
    const { name, anime, description } = req.body;
    if (!name || !anime) {
        return res.status(400).json({ error: "Le nom et l'anime sont obligatoires" });
    }

    const query = `INSERT INTO characters (name, anime, description) VALUES (?, ?, ?)`;
    db.run(query, [name, anime, description], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ id: this.lastID, name, anime, description });
    });
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`Serveur API en écoute sur http://localhost:${PORT}`);
});