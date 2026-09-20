const db = require('../config/database');

function findAll(callback) {
    db.all(
        `
        SELECT id, name
        FROM universes
        ORDER BY name
        `,
        [],
        callback
    );
}

function findById(id, callback) {
    db.get(
        `
        SELECT id, name
        FROM universes
        WHERE id = ?
        `,
        [id],
        callback
    );
}

function create(name, callback) {
    db.run(
        `
        INSERT INTO universes (name)
        VALUES (?)
        `,
        [name],
        function (error) {
            if (error) {
                callback(error);
                return;
            }

            callback(null, this.lastID);
        }
    );
}

function update(id, name, callback) {
    db.run(
        `
        UPDATE universes
        SET name = ?
        WHERE id = ?
        `,
        [name, id],
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
    db.run(
        `
        DELETE FROM universes
        WHERE id = ?
        `,
        [id],
        function (error) {
            if (error) {
                callback(error);
                return;
            }

            callback(null, this.changes);
        }
    );
}

module.exports = {
    findAll,
    findById,
    create,
    update,
    deleteById
};