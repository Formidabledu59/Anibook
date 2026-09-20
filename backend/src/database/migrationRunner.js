const fs = require('fs');
const path = require('path');

const db = require('../config/database');

function runQuery(query) {
    return new Promise((resolve, reject) => {
        db.exec(query, (error) => {
            if (error) {
                reject(error);
                return;
            }

            resolve();
        });
    });
}

function getMigrations() {
    return new Promise((resolve, reject) => {
        db.all(
            `
            SELECT name
            FROM migrations
            ORDER BY name
            `,
            [],
            (error, rows) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(rows.map((row) => row.name));
            }
        );
    });
}

async function runMigrations() {
    try {
        await runQuery(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                executed_at TEXT NOT NULL
            )
        `);

        const executedMigrations = await getMigrations();

        const migrationsDirectory = path.join(__dirname, 'migrations');

        const migrationFiles = fs
            .readdirSync(migrationsDirectory)
            .filter((file) => file.endsWith('.sql'))
            .sort();

        for (const migrationFile of migrationFiles) {
            if (executedMigrations.includes(migrationFile)) {
                continue;
            }

            const migrationPath = path.join(
                migrationsDirectory,
                migrationFile
            );

            const sql = fs.readFileSync(migrationPath, 'utf8');

            await runQuery(sql);

            await runQuery(`
                INSERT INTO migrations (name, executed_at)
                VALUES (
                    '${migrationFile}',
                    '${new Date().toISOString()}'
                )
            `);

            console.log(`Migration exécutée : ${migrationFile}`);
        }

        console.log('Migrations terminées.');
    } catch (error) {
        console.error(
            'Erreur pendant les migrations :',
            error.message
        );

        throw error;
    }
}

module.exports = {
    runMigrations
};