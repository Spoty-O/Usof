const Router = require('express');
const router = new Router();
const postsController = require('../controllers/posts_controller');
const authCheckMiddleware = require('../middleware/authCheckMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authCheckMiddleware, postsController.get_all_posts);
router.get('/:id', authCheckMiddleware, postsController.get_post);
router.get('/:id/comments', postsController.get_comments);
router.post('/:id/comments', authMiddleware, postsController.create_comment);
router.get('/:id/categories', postsController.get_post_categories);
router.get('/:id/like', postsController.get_post_likes);
router.post('/', authMiddleware, postsController.create_post);
router.post('/:id/like', authMiddleware, postsController.set_like);
router.patch('/:id', authMiddleware, postsController.update_post);
router.delete('/:id', authMiddleware, postsController.delete_post);
router.delete('/:id/like', authMiddleware, postsController.delete_like);

module.exports = router;