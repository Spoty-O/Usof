const ApiError = require('../error/ApiError');
const { Comment, CommentLike, User } = require('../models/models');

class CommentsController {
    async get_comment_data(req, res, next) {
        try {
            const { id } = req.params;
            const comment = await Comment.findOne({ where: { id } });
            if (!comment) {
                return next(ApiError.badRequest("Комментария не найдена!"));
            }
            return res.json(comment);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async get_comment_likes(req, res, next) {
        try {
            const { id } = req.params;
            const likes = await CommentLike.findAll({ where: { commentId: id } });
            return res.json(likes);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async set_like(req, res, next) {
        try {
            const { id } = req.params;
            const comment_like = await CommentLike.findOne({ where: { userId: req.user.id, commentId: id } });
            if (comment_like) {
                return next(ApiError.badRequest("Like was been added!"));
            }
            const comment = await Comment.findOne({ where: { id } });
            if (!comment) {
                return next(ApiError.badRequest("Комментария не найдена!"));
            }
            await CommentLike.create({ commentId: id, userId: req.user.id, like_type: "like" });
            await User.increment({ rating: 1 }, { where: { id: comment.userId } });
            return res.json({ message: "Like added!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async update_comment(req, res, next) {
        try {
            const { id } = req.params;
            const { content } = req.body;
            if (!content) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            const comment = await Comment.findOne({ where: { id } });
            if (!comment) {
                return next(ApiError.badRequest("Комментарий не найдена!"));
            }
            if (req.user.id != comment.userId) {
                return next(ApiError.badRequest("Нет доступа!"));
            }
            await Comment.update({ content }, { where: { id } });
            return res.json({ message: "Comment updated!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async delete_comment(req, res, next) {
        try {
            const { id } = req.params;
            const comment = await Comment.findOne({ where: { id } });
            if (req.user.id != comment.userId && req.user.role != 'ADMIN') {
                return next(ApiError.badRequest("Нет доступа!"));
            }
            await Comment.destroy({ where: { id } });
            return res.json({ message: "Comment deleted!" });
        } catch (error) {
            return next(ApiError.badRequest("Delete comment error!"));
        }
    }

    async delete_like(req, res, next) {
        try {
            const { id } = req.params;
            const comment = await Comment.findOne({ where: { id } });
            await User.decrement({ rating: 1 }, { where: { id: comment.userId } });
            await CommentLike.destroy({ where: { userId: req.user.id, commentId: id } });
            return res.json({ message: "Like deleted!" });
        } catch (error) {
            return next(ApiError.badRequest("Delete comment like error!"));
        }
    }
}

module.exports = new CommentsController();