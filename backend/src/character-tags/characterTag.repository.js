const db = require('../config/database');

function findTagsByCharacterId(characterId, callback) {
    db.all(
        `
        SELECT
            t.id,
            t.name
        FROM tags t
        INNER JOIN character_tags ct
            ON ct.tag_id = t.id
        WHERE ct.character_id = ?
        ORDER BY t.name
        `,
        [characterId],
        callback
    );
}

function addTagToCharacter(characterId, tagId, callback) {
    db.run(
        `
        INSERT INTO character_tags (
            character_id,
            tag_id
        )
        VALUES (?, ?)
        `,
        [characterId, tagId],
        function (error) {
            if (error) {
                callback(error);
                return;
            }

            callback(null, this.changes);
        }
    );
}

function removeTagFromCharacter(
    characterId,
    tagId,
    callback
) {
    db.run(
        `
        DELETE FROM character_tags
        WHERE character_id = ?
        AND tag_id = ?
        `,
        [characterId, tagId],
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
    findTagsByCharacterId,
    addTagToCharacter,
    removeTagFromCharacter
};