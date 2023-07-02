const Router = require('express');
const router = new Router();
const authRouter = require('./auth_router');
const userRouter = require('./users_router');
const postsRouter = require('./posts_router');
const categoriesRouter = require('./categories_router');
const commentsRouter = require('./comments_router');

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/posts', postsRouter);
router.use('/categories', categoriesRouter);
router.use('/comments', commentsRouter);

module.exports = router;