const db = require('../config/database');

function findAll(callback) {
    const query = `
        SELECT
            c.id,
            c.name,
            c.icon,
            c.illustration,
            c.description,
            u.id AS universe_id,
            u.name AS universe
        FROM characters c
        INNER JOIN universes u
            ON u.id = c.universe_id
        ORDER BY c.name
    `;

    db.all(query, [], callback);
}

function findById(id, callback) {
    const query = `
        SELECT
            c.id,
            c.name,
            c.icon,
            c.illustration,
            c.description,
            u.id AS universe_id,
            u.name AS universe
        FROM characters c
        INNER JOIN universes u
            ON u.id = c.universe_id
        WHERE c.id = ?
    `;

    db.get(query, [id], callback);
}

function create(character, callback) {
    const query = `
        INSERT INTO characters (
            name,
            universe_id,
            icon,
            illustration,
            description
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
        query,
        [
            character.name,
            character.universeId,
            character.icon,
            character.illustration,
            character.description
        ],
        function (error) {
            if (error) {
                callback(error);
                return;
            }

            callback(null, this.lastID);
        }
    );
}

function update(id, character, callback) {
    const query = `
        UPDATE characters
        SET
            name = ?,
            universe_id = ?,
            icon = ?,
            illustration = ?,
            description = ?
        WHERE id = ?
    `;

    db.run(
        query,
        [
            character.name,
            character.universeId,
            character.icon,
            character.illustration,
            character.description,
            id
        ],
        function (error) {
            if (error) {
                callback(error);
                return;
            }

            callback(null, this.changes);
        }
    );
}

function deleteById(id, callback) {
    const query = `
        DELETE FROM characters
        WHERE id = ?
    `;

    db.run(query, [id], function (error) {
        if (error) {
            callback(error);
            return;
        }

        callback(null, this.changes);
    });
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteById
};