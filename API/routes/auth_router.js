const Router = require('express');
const router = new Router();
const authController = require('../controllers/auth_controller');
const authCheckMiddleware = require('../middleware/authCheckMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.get('/register/:token', authController.email_confirm);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/password-reset', authController.password_reset);
router.post('/password-reset/:token', authController.password_confirm);
router.get('/refresh-token', authController.check);

module.exports = router;