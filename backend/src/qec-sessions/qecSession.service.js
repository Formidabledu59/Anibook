const crypto = require('crypto');

const characterRepository = require('../characters/character.repository');
const repository = require('./qecSession.repository');

function findCharacters(filters) {
    return new Promise((resolve, reject) => {
        characterRepository.findAll(filters, (error, characters) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(characters);
        });
    });
}

function createSession(session, characterIds) {
    return new Promise((resolve, reject) => {
        repository.createSession(
            session,
            characterIds,
            (error, id) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({ id, ...session, characterIds });
            }
        );
    });
}

function getSessionByCode(code) {
    return new Promise((resolve, reject) => {
        repository.findByCode(code, async (error, session) => {
            if (error) {
                reject(error);
                return;
            }

            if (!session) {
                resolve(null);
                return;
            }

            repository.findCharacters(
                session.id,
                (charactersError, characters) => {
                    if (charactersError) {
                        reject(charactersError);
                        return;
                    }

                    resolve({ ...session, characters });
                }
            );
        });
    });
}

function getAllSessions() {
    return new Promise((resolve, reject) => {
        repository.findAll((error, sessions) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(sessions);
        });
    });
}

function deleteSession(id) {
    return new Promise((resolve, reject) => {
        repository.deleteById(id, (error, changes) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(changes > 0);
        });
    });
}

function deleteAllSessions() {
    return new Promise((resolve, reject) => {
        repository.deleteAll((error, changes) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(changes);
        });
    });
}

function generateCode() {
    return crypto.randomBytes(5)
        .toString('hex')
        .toUpperCase()
        .slice(0, 8);
}

function seedFromCode(code) {
    let seed = 0;

    for (let index = 0; index < code.length; index += 1) {
        seed = (seed * 31 + code.charCodeAt(index)) >>> 0;
    }

    return seed || 1;
}

function shuffle(characters, seed) {
    const result = [...characters];
    let currentSeed = seed;

    for (let index = result.length - 1; index > 0; index -= 1) {
        currentSeed = (currentSeed * 1664525 + 1013904223) >>> 0;
        const swapIndex = currentSeed % (index + 1);
        [result[index], result[swapIndex]] =
            [result[swapIndex], result[index]];
    }

    return result;
}

async function createGame(options) {
    const code = options.code || generateCode();
    const seed = seedFromCode(code);
    const characters = await findCharacters({
        search: '',
        universeId: options.universeId,
        tagId: options.tagId,
        limit: 100000
    });

    const selectedCharacters = shuffle(characters, seed)
        .slice(0, options.boardSize);

    if (selectedCharacters.length < 2) {
        const error = new Error(
            'Il faut au moins deux personnages pour créer une partie'
        );

        error.code = 'QEC_NOT_ENOUGH_CHARACTERS';
        throw error;
    }

    return createSession(
        {
            code,
            universeId: options.universeId,
            tagId: options.tagId,
            boardSize: selectedCharacters.length,
            seed,
            createdAt: new Date().toISOString()
        },
        selectedCharacters.map((character) => character.id)
    );
}

module.exports = {
    createGame,
    getSessionByCode,
    getAllSessions,
    deleteSession,
    deleteAllSessions
};
