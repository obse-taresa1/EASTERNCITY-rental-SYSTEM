const express = require('express');
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const notificationRoutes = require('./notificationRoutes');
const verificationRoutes = require('./verificationRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);
router.use('/verification', verificationRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy.',
    data: {
      service: 'EasternCity Rental System API',
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
