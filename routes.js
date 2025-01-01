const router = require('express').Router();
const authController = require('./controllers/auth-controller');
const activateController = require('./controllers/activate-controller');
const upload = require('./middlewares/upload-middleware');
const authMiddleware = require('./middlewares/auth-middleware');

// Mounting routes
router.post('/api/send-otp', authController.sendOtp);
router.post('/api/verify-otp', authController.verifyOtp);
router.post('/api/activate', authMiddleware, upload.single("avatar"), activateController.activate);
router.get('/api/refresh', authController.refresh);
router.post('/api/logout',authMiddleware, authController.logout);

module.exports = router;