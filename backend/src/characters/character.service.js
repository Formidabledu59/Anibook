const repository = require('./character.repository');

function getAllCharacters(filters) {
    return new Promise((resolve, reject) => {
        repository.findAll(filters, (error, characters) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(characters);
        });
    });
}

function getCharacterById(id) {
    return new Promise((resolve, reject) => {
        repository.findById(id, (error, character) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(character ?? null);
        });
    });
}

function getRandomCharacter() {
    return new Promise((resolve, reject) => {
        repository.findRandom((error, character) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(character ?? null);
        });
    });
}

function createCharacter(character) {
    return new Promise((resolve, reject) => {
        repository.create(character, (error, id) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({
                id,
                ...character
            });
        });
    });
}

function updateCharacter(id, character) {
    return new Promise((resolve, reject) => {
        repository.update(id, character, (error, changes) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(changes > 0);
        });
    });
}

function deleteCharacter(id) {
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

module.exports = {
    getAllCharacters,
    getCharacterById,
    getRandomCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter
};