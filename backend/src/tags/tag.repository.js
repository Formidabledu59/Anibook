const db = require('../config/database');

function findAll(callback) {
    db.all(
        `
        SELECT id, name
        FROM tags
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
        FROM tags
        WHERE id = ?
        `,
        [id],
        callback
    );
}

function create(name, callback) {
    db.run(
        `
        INSERT INTO tags (name)
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
        UPDATE tags
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
        DELETE FROM tags
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