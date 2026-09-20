const service = require('./characterTag.service');

function parseId(value) {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

async function getTags(req, res, next) {
    try {
        const characterId = parseId(req.params.characterId);

        if (!characterId) {
            res.status(400).json({
                error: 'Identifiant du personnage invalide'
            });
            return;
        }

        const tags = await service.getTagsByCharacterId(
            characterId
        );

        res.json({
            tags
        });
    } catch (error) {
        next(error);
    }
}

async function addTag(req, res, next) {
    try {
        const characterId = parseId(req.params.characterId);
        const tagId = parseId(req.params.tagId);

        if (!characterId || !tagId) {
            res.status(400).json({
                error: 'Identifiant invalide'
            });
            return;
        }

        await service.addTagToCharacter(
            characterId,
            tagId
        );

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function removeTag(req, res, next) {
    try {
        const characterId = parseId(req.params.characterId);
        const tagId = parseId(req.params.tagId);

        if (!characterId || !tagId) {
            res.status(400).json({
                error: 'Identifiant invalide'
            });
            return;
        }

        const removed = await service.removeTagFromCharacter(
            characterId,
            tagId
        );

        if (!removed) {
            res.status(404).json({
                error: 'Association introuvable'
            });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getTags,
    addTag,
    removeTag
};