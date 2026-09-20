const repository = require('./tag.repository');

function getAllTags() {
    return new Promise((resolve, reject) => {
        repository.findAll((error, tags) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(tags);
        });
    });
}

function getTagById(id) {
    return new Promise((resolve, reject) => {
        repository.findById(id, (error, tag) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(tag ?? null);
        });
    });
}

function createTag(name) {
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

function updateTag(id, name) {
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

function deleteTag(id) {
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
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag
};