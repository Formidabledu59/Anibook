const express = require('express');

const controller = require('./characterTag.controller');

const router = express.Router();

router.get(
    '/:characterId/tags',
    controller.getTags
);

router.post(
    '/:characterId/tags/:tagId',
    controller.addTag
);

router.delete(
    '/:characterId/tags/:tagId',
    controller.removeTag
);

module.exports = router;