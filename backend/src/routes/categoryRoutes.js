const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const controller = require('../controllers/categoryController');
const { validateCategory } = require('../validators/categoryValidator');

router.get('/', controller.list);
router.post('/', auth, authorize('ADMIN', 'SUPER_ADMIN'), validateCategory, controller.create);
router.patch('/:id', auth, authorize('ADMIN', 'SUPER_ADMIN'), validateCategory, controller.update);
router.delete('/:id', auth, authorize('ADMIN', 'SUPER_ADMIN'), controller.remove);

module.exports = router;