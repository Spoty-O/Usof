const Router = require('express');
const router = new Router();
const categoriesController = require('../controllers/categories_controller');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

router.get('/', categoriesController.get_categories);
router.get('/:id', categoriesController.get_category_data);
router.get('/:id/posts', categoriesController.get_category_posts);
router.post('/', checkRoleMiddleware("ADMIN"), categoriesController.create_category);
router.patch('/:id', checkRoleMiddleware("ADMIN"), categoriesController.update_category);
router.delete('/:id', checkRoleMiddleware("ADMIN"), categoriesController.delete_category);

module.exports = router;