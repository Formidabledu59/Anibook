const service = require('./character.service');
const {
    toCreateCharacterDto,
    toUpdateCharacterDto
} = require('./character.dto');

function parseId(value) {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

async function getAll(req, res, next) {
    try {
        const characters = await service.getAllCharacters();

        res.json({
            characters
        });
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            res.status(400).json({
                error: 'Identifiant invalide'
            });
            return;
        }

        const character = await service.getCharacterById(id);

        if (!character) {
            res.status(404).json({
                error: 'Personnage introuvable'
            });
            return;
        }

        res.json(character);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const character = toCreateCharacterDto(req.body);

        if (!character.name || !character.universeId) {
            res.status(400).json({
                error: 'Le nom et l’univers sont obligatoires'
            });
            return;
        }

        const created = await service.createCharacter(character);

        res.status(201).json(created);
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            res.status(400).json({
                error: 'Identifiant invalide'
            });
            return;
        }

        const character = toUpdateCharacterDto(req.body);

        if (!character.name || !character.universeId) {
            res.status(400).json({
                error: 'Le nom et l’univers sont obligatoires'
            });
            return;
        }

        const updated = await service.updateCharacter(
            id,
            character
        );

        if (!updated) {
            res.status(404).json({
                error: 'Personnage introuvable'
            });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function remove(req, res, next) {
    try {
        const id = parseId(req.params.id);

        if (!id) {
            res.status(400).json({
                error: 'Identifiant invalide'
            });
            return;
        }

        const deleted = await service.deleteCharacter(id);

        if (!deleted) {
            res.status(404).json({
                error: 'Personnage introuvable'
            });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove
};