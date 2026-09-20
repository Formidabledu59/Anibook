const service = require('./qecSession.service');

function parsePositiveId(value) {
    const id = Number(value);

    return Number.isInteger(id) && id > 0 ? id : null;
}

function normalizeCode(value) {
    return typeof value === 'string'
        ? value.trim().toUpperCase()
        : '';
}

function parseOptions(body) {
    const boardSize = Number(body.boardSize);
    const universeId = parsePositiveId(body.universeId);
    const tagId = parsePositiveId(body.tagId);

    return {
        code: normalizeCode(body.code),
        universeId,
        tagId,
        boardSize: Number.isInteger(boardSize) &&
            boardSize >= 2 &&
            boardSize <= 50
            ? boardSize
            : 24
    };
}

async function create(req, res, next) {
    try {
        const options = parseOptions(req.body || {});

        if (options.code && !/^[A-Z0-9]{4,12}$/.test(options.code)) {
            res.status(400).json({
                error: 'Le code doit contenir entre 4 et 12 caractères alphanumériques'
            });
            return;
        }

        const session = await service.createGame(options);

        res.status(201).json(session);
    } catch (error) {
        if (error.code === 'QEC_NOT_ENOUGH_CHARACTERS') {
            res.status(400).json({
                error: error.message
            });
            return;
        }

        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(409).json({
                error: 'Ce code de partie existe déjà'
            });
            return;
        }

        next(error);
    }
}

async function join(req, res, next) {
    try {
        const code = normalizeCode(req.params.code);
        const session = await service.getSessionByCode(code);

        if (!session) {
            res.status(404).json({
                error: 'Partie introuvable'
            });
            return;
        }

        res.json(session);
    } catch (error) {
        next(error);
    }
}

async function getAll(req, res, next) {
    try {
        res.json({
            sessions: await service.getAllSessions()
        });
    } catch (error) {
        next(error);
    }
}

async function remove(req, res, next) {
    try {
        const id = parsePositiveId(req.params.id);

        if (!id) {
            res.status(400).json({
                error: 'Identifiant invalide'
            });
            return;
        }

        const deleted = await service.deleteSession(id);

        if (!deleted) {
            res.status(404).json({
                error: 'Partie introuvable'
            });
            return;
        }

        res.status(204).send();
    } catch (error) {
        next(error);
    }
}

async function removeAll(req, res, next) {
    try {
        const deleted = await service.deleteAllSessions();

        res.json({ deleted });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    create,
    join,
    getAll,
    remove,
    removeAll
};
