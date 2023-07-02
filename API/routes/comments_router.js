const Router = require('express');
const router = new Router();
const commentController = require('../controllers/comments_controller');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/:id', commentController.get_comment_data);
router.get('/:id/like', commentController.get_comment_likes);
router.post('/:id/like', authMiddleware, commentController.set_like);
router.patch('/:id', authMiddleware, commentController.update_comment);
router.delete('/:id', authMiddleware, commentController.delete_comment);
router.delete('/:id/like', authMiddleware, commentController.delete_like);

module.exports = router;