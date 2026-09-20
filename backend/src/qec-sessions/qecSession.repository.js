const db = require('../config/database');

function createSession(session, characterIds, callback) {
    db.serialize(() => {
        db.run(
            `
            INSERT INTO qec_sessions (
                code,
                universe_id,
                tag_id,
                board_size,
                seed,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                session.code,
                session.universeId,
                session.tagId,
                session.boardSize,
                session.seed,
                session.createdAt
            ],
            function (error) {
                if (error) {
                    callback(error);
                    return;
                }

                const sessionId = this.lastID;
                const insert = db.prepare(
                    `
                    INSERT INTO qec_session_characters (
                        session_id,
                        character_id,
                        position
                    )
                    VALUES (?, ?, ?)
                    `
                );

                characterIds.forEach((characterId, position) => {
                    insert.run(sessionId, characterId, position);
                });

                insert.finalize((finalizeError) => {
                    if (finalizeError) {
                        callback(finalizeError);
                        return;
                    }

                    callback(null, sessionId);
                });
            }
        );
    });
}

function findByCode(code, callback) {
    db.get(
        `
        SELECT
            s.id,
            s.code,
            s.universe_id,
            s.tag_id,
            s.board_size,
            s.seed,
            s.created_at,
            u.name AS universe,
            t.name AS tag
        FROM qec_sessions s
        LEFT JOIN universes u ON u.id = s.universe_id
        LEFT JOIN tags t ON t.id = s.tag_id
        WHERE s.code = ?
        `,
        [code],
        callback
    );
}

function findCharacters(sessionId, callback) {
    db.all(
        `
        SELECT
            c.id,
            c.name,
            c.icon,
            c.illustration,
            c.description,
            u.id AS universe_id,
            u.name AS universe,
            sc.position,
            (
                SELECT GROUP_CONCAT(t.name, '|')
                FROM character_tags ct
                INNER JOIN tags t ON t.id = ct.tag_id
                WHERE ct.character_id = c.id
            ) AS tag_names
        FROM qec_session_characters sc
        INNER JOIN characters c ON c.id = sc.character_id
        INNER JOIN universes u ON u.id = c.universe_id
        WHERE sc.session_id = ?
        ORDER BY sc.position
        `,
        [sessionId],
        callback
    );
}

function findAll(callback) {
    db.all(
        `
        SELECT
            s.id,
            s.code,
            s.board_size,
            s.created_at,
            u.name AS universe,
            t.name AS tag,
            COUNT(sc.character_id) AS character_count
        FROM qec_sessions s
        LEFT JOIN universes u ON u.id = s.universe_id
        LEFT JOIN tags t ON t.id = s.tag_id
        LEFT JOIN qec_session_characters sc ON sc.session_id = s.id
        GROUP BY s.id
        ORDER BY s.created_at DESC
        `,
        [],
        callback
    );
}

function deleteById(id, callback) {
    db.run(
        'DELETE FROM qec_sessions WHERE id = ?',
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

function deleteAll(callback) {
    db.run(
        'DELETE FROM qec_sessions',
        [],
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
    createSession,
    findByCode,
    findCharacters,
    findAll,
    deleteById,
    deleteAll
};
