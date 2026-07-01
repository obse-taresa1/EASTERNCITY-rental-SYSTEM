const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/reviewController');
const { validateReview } = require('../validators/reviewValidator');

router.get('/listing/:listingId', controller.listByListing);
router.post('/', auth, validateReview, controller.create);

module.exports = router;