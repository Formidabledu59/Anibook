const express = require('express');
const cors = require('cors');

const { runMigrations } = require('./database/migrationRunner');

const characterRoutes = require('./characters/character.routes');
const universeRoutes = require('./universes/universe.routes');
const tagRoutes = require('./tags/tag.routes');
const characterTagRoutes = require('./character-tags/characterTag.routes');
const qecSessionRoutes = require('./qec-sessions/qecSession.routes');

const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/error.middleware');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK'
    });
});

app.use('/api/characters', characterRoutes);
app.use('/api/universes', universeRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/characters', characterTagRoutes);
app.use('/api/qec/sessions', qecSessionRoutes);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
    try {
        await runMigrations();

        app.listen(PORT, () => {
            console.log(
                `API Anibook démarrée sur http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            'Impossible de démarrer le serveur :',
            error.message
        );

        process.exit(1);
    }
}

startServer();