const repository = require('./characterTag.repository');

function getTagsByCharacterId(characterId) {
    return new Promise((resolve, reject) => {
        repository.findTagsByCharacterId(
            characterId,
            (error, tags) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(tags);
            }
        );
    });
}

function addTagToCharacter(characterId, tagId) {
    return new Promise((resolve, reject) => {
        repository.addTagToCharacter(
            characterId,
            tagId,
            (error, changes) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(changes > 0);
            }
        );
    });
}

function removeTagFromCharacter(characterId, tagId) {
    return new Promise((resolve, reject) => {
        repository.removeTagFromCharacter(
            characterId,
            tagId,
            (error, changes) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(changes > 0);
            }
        );
    });
}

module.exports = {
    getTagsByCharacterId,
    addTagToCharacter,
    removeTagFromCharacter
};