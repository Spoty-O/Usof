const ApiError = require('../error/ApiError');
const { Category, Posts, Comment, PostLike, User } = require('../models/models');
const { Op, literal } = require('sequelize');

async function filter_params(req) {
    let { limit, page, categories, startDate, endDate, status, like, date_sort } = req.query;
    console.log(date_sort);
    page = page || 1;
    limit = limit || 10;
    let offset = page * limit - limit;
    let object = { limit, offset, where: {}, order: [] };
    if (req.user) {
        if (req.user.role == 'USER') {
            object.where = { [Op.or]: [{ userId: req.user.id }, { status: true }] };
        }
    } else {
        object.where = { status: true };
    }
    object.include = [{ model: Category }, { model: PostLike }];
    if (categories) {
        object.include[0].where.id = categories.split(',');
    }
    if (startDate && endDate) {
        object.where.createdAt = { [Op.between]: [startDate + ' 00:00:00', endDate + ' 23:59:59'] };
    } else if (!startDate && endDate) {
        let oldest_post = await Posts.findOne({ order: [['id', 'ASC']] });
        object.where.createdAt = { [Op.between]: [oldest_post.createdAt, endDate + ' 23:59:59'] };
    } else if (startDate && !endDate) {
        object.where.createdAt = { [Op.between]: [startDate + ' 00:00:00', Date.now()] };
    }
    if (status == 1) {
        object.order.push(['status', 'DESC']);
    } else if (status == 0) {
        object.order.push(['status', 'ASC']);
    }
    object.attributes = {
        include: [
            [literal(`(SELECT COUNT(*) FROM post_likes WHERE "postId" = posts.id)`), 'likescount']
        ]
    }
    if (like == 1) {
        console.log("work")
        object.order.push([literal('likescount'), 'DESC']);
    } else if (like == 0) {
        object.order.push([literal('likescount'), 'ASC']);
    }
    if (date_sort == 1) {
        object.order.push(['createdAt', 'DESC'])
    } else if (date_sort == 0) {
        object.order.push(['createdAt', 'ASC'])
    }
    console.log(object)
    return object;
}

class PostsController {
    async get_all_posts(req, res) {
        try {
            let filter = await filter_params(req);
            const posts = await Posts.findAll(filter);
            return res.json(posts);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async get_post(req, res, next) {
        try {
            const { id } = req.params;
            let object = { where: {} };
            if (req.user) {
                if (req.user.role == 'USER') {
                    object.where = { [Op.or]: [{ userId: req.user.id }, { status: true }] };
                }
            } else {
                object.where = { status: true };
            }
            object.where.id = id;
            const post = await Posts.findOne(object);
            if (!post) {
                return next(ApiError.badRequest("Пост не найдена!"));
            }
            return res.json(post);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async get_comments(req, res, next) {
        try {
            const { id } = req.params;
            let { limit, page } = req.query;
            page = page || 1;
            limit = limit || 10;
            let offset = page * limit - limit;
            const comments = await Comment.findAll({ limit, offset, include: { model: Posts, where: { id } } });
            console.log(comments)
            return res.json(comments);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async create_comment(req, res, next) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            if (!content) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            const post = await Posts.findOne({ where: { id } });
            if (!post) {
                return next(ApiError.badRequest("Пост не найдена!"));
            }
            await post.addComment(await Comment.create({ content, userId: req.user.id }));
            return res.json({ message: "Comment created!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async get_post_categories(req, res, next) {
        try {
            const { id } = req.params;
            const post = await Posts.findOne({ where: { id }, include: { model: Category } });
            if (!post) {
                return next(ApiError.badRequest("Пост не найдена!"));
            }
            return res.json(post.categories);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async get_post_likes(req, res, next) {
        try {
            const { id } = req.params;
            const likes = await PostLike.findAll({ include: { model: Posts, where: { id } } });
            return res.json(likes);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async create_post(req, res, next) {
        try {
            let { title, content, categories } = req.body;
            categories = categories || 1;
            if (!title || !content || !categories) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            const post = await Posts.create({ title, content, userId: req.user.id });
            await post.addCategory(await Category.findAll({ where: { id: JSON.parse(categories) } }));
            return res.json({ message: "Create success!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async set_like(req, res, next) {
        try {
            const { id } = req.params;
            const post_like = await PostLike.findOne({ where: { userId: req.user.id, postId: id } });
            if (post_like) {
                return next(ApiError.badRequest("Like was been added!"));
            }
            const post = await Posts.findOne({ where: { id } });
            if (!post) {
                return next(ApiError.forbidden("Пост не найдена!"));
            }
            await PostLike.create({ postId: id, userId: req.user.id, like_type: "like" });
            await User.increment({ rating: 1 }, { where: { id: post.userId } });
            return res.json({ message: "Like added!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async update_post(req, res, next) {
        try {
            const { id } = req.params;
            const { content, categories, status } = req.body;
            let object = {};
            const post = await Posts.findOne({ where: { id } });
            if (!post) {
                return next(ApiError.badRequest("Пост не найдена!"));
            }
            if (req.user.id != post.userId && req.user.role != 'ADMIN') {
                return next(ApiError.badRequest("Нет доступа!"));
            }
            if (content && req.user.id == post.userId) object.content = content;
            if (status && req.user.role == 'ADMIN') object.status = status;
            if (!object) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            await Posts.update(object, { where: { id } });
            if (categories && (req.user.id == post.userId || req.user.role == 'ADMIN')) {
                await post.setCategories(await Category.findAll({ where: { id: categories } }));
            }
            return res.json({ message: "Post updated!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async delete_post(req, res, next) {
        try {
            const { id } = req.params;
            const post = await Posts.findOne({ where: { id } });
            if (req.user.id != post.userId && req.user.role != 'ADMIN') {
                return next(ApiError.badRequest("Нет доступа!"));
            }
            await Posts.destroy({ where: { id } });
            return res.json({ message: "Post deleted!" });
        } catch (error) {
            return next(ApiError.badRequest("Delete post error!"));
        }
    }

    async delete_like(req, res, next) {
        try {
            const { id } = req.params;
            const post = await Posts.findOne({ where: { id } });
            await User.decrement({ rating: 1 }, { where: { id: post.userId } });
            await PostLike.destroy({ where: { userId: req.user.id, postId: id } });
            return res.json({ message: "Like deleted!" });
        } catch (error) {
            return next(ApiError.badRequest("Delete like error!"));
        }
    }
}

module.exports = new PostsController();