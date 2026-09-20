const service = require('./tag.service');

const {
    toCreateTagDto,
    toUpdateTagDto
} = require('./tag.dto');

function parseId(value) {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

async function getAll(req, res, next) {
    try {
        res.json({
            tags: await service.getAllTags()
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

        const tag = await service.getTagById(id);

        if (!tag) {
            res.status(404).json({
                error: 'Tag introuvable'
            });
            return;
        }

        res.json(tag);
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const { name } = toCreateTagDto(req.body);

        if (!name) {
            res.status(400).json({
                error: 'Le nom est obligatoire'
            });
            return;
        }

        res.status(201).json(
            await service.createTag(name)
        );
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const id = parseId(req.params.id);
        const { name } = toUpdateTagDto(req.body);

        if (!id || !name) {
            res.status(400).json({
                error: 'Identifiant et nom obligatoires'
            });
            return;
        }

        const updated = await service.updateTag(id, name);

        if (!updated) {
            res.status(404).json({
                error: 'Tag introuvable'
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

        const deleted = await service.deleteTag(id);

        if (!deleted) {
            res.status(404).json({
                error: 'Tag introuvable'
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