const express = require('express');

const controller = require('./qecSession.controller');

const router = express.Router();

router.get('/', controller.getAll);
router.post('/', controller.create);
router.delete('/all', controller.removeAll);
router.get('/:code', controller.join);
router.delete('/:id', controller.remove);

module.exports = router;
