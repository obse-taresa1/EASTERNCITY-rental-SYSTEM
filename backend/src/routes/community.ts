// backend/src/routes/community.ts
import express from 'express';
import { createCommunityPost, getCommunityPosts, getCommunityPostById, uploadMedia } from '../controllers/communityController';
import multer from 'multer';

const router = express.Router();

// Configure multer for media uploads (store files in ./uploads/community)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/community');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Create a new community post (rental request, feed, etc.)
router.post('/', createCommunityPost);

// Get posts with optional filters (city, neighbourhood, type, category)
router.get('/', getCommunityPosts);

// Get a single post by id
router.get('/:id', getCommunityPostById);

// Upload media files for a post (multiple files)
router.post('/:id/media', upload.array('media', 10), uploadMedia);

export default router;
