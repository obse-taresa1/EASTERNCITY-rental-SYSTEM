const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authenticate = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'community');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { files: 5, fileSize: 8 * 1024 * 1024 } });

// Public routes
// Public routes
router.get('/', optionalAuth, communityController.getCommunityPosts);
router.get('/saved', authenticate, communityController.getSavedPosts);
router.get('/:id/comments', optionalAuth, communityController.getComments);
router.get('/:id', optionalAuth, communityController.getCommunityPostById);

// Protected routes
router.post('/', authenticate, upload.array('media', 5), communityController.createCommunityPost);
router.post('/:id/media', authenticate, upload.array('media', 5), communityController.uploadMedia);

// Interaction routes (authenticated)
router.post('/:id/views', authenticate, communityController.incrementViews);
router.post('/:id/shares', authenticate, communityController.incrementShares);
router.post('/:id/resolve', authenticate, communityController.resolvePost);
router.post('/:id/like', authenticate, communityController.likePost);
router.post('/:id/unlike', authenticate, communityController.unlikePost);
router.post('/:id/comment', authenticate, communityController.addComment);
router.delete('/comment/:commentId', authenticate, communityController.deleteComment);
router.put('/comment/:commentId', authenticate, communityController.editComment);
router.post('/:id/save', authenticate, communityController.savePost);
router.post('/:id/unsave', authenticate, communityController.unsavePost);

module.exports = router;
