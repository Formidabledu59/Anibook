const service = require('./universe.service');

const {
    toCreateUniverseDto,
    toUpdateUniverseDto
} = require('./universe.dto');

function parseId(value) {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

async function getAll(req, res, next) {
    try {
        res.json({
            universes: await service.getAllUniverses()
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

        const universe = await service.getUniverseById(id);

        if (!universe) {
            res.status(404).json({
                error: 'Univers introuvable'
            });
            return;
        }

        res.json(universe);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { name } = toCreateUniverseDto(req.body);

        if (!name) {
            res.status(400).json({
                error: 'Le nom est obligatoire'
            });
            return;
        }

        res.status(201).json(
            await service.createUniverse(name)
        );
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const id = parseId(req.params.id);
        const { name } = toUpdateUniverseDto(req.body);

        if (!id || !name) {
            res.status(400).json({
                error: 'Identifiant et nom obligatoires'
            });
            return;
        }

        const updated = await service.updateUniverse(id, name);

        if (!updated) {
            res.status(404).json({
                error: 'Univers introuvable'
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

        const deleted = await service.deleteUniverse(id);

        if (!deleted) {
            res.status(404).json({
                error: 'Univers introuvable'
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