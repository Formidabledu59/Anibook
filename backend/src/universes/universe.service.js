const repository = require('./universe.repository');

function getAllUniverses() {
    return new Promise((resolve, reject) => {
        repository.findAll((error, universes) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(universes);
        });
    });
}

function getUniverseById(id) {
    return new Promise((resolve, reject) => {
        repository.findById(id, (error, universe) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(universe ?? null);
        });
    });
}

function createUniverse(name) {
    return new Promise((resolve, reject) => {
        repository.create(name, (error, id) => {
            if (error) {
                reject(error);
                return;
            }

            resolve({
                id,
                name
            });
        });
    });
}

function updateUniverse(id, name) {
    return new Promise((resolve, reject) => {
        repository.update(id, name, (error, changes) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(changes > 0);
        });
    });
}

function deleteUniverse(id) {
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
    getAllUniverses,
    getUniverseById,
    createUniverse,
    updateUniverse,
    deleteUniverse
};