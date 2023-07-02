const ApiError = require('../error/ApiError');
const { Category, Posts } = require('../models/models');

class CategoriesController {
    async get_categories(req, res) {
        try {
            let { limit, page } = req.query;
            page = page || 1;
            limit = limit || 10;
            let offset = page * limit - limit;
            const categories = await Category.findAll({ limit, offset });
            return res.json(categories);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async get_category_data(req, res, next) {
        try {
            const { id } = req.params;
            const category = await Category.findOne({ where: { id } });
            if (!category) {
                return next(ApiError.badRequest("Категория не найдена!"));
            }
            return res.json(category);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async get_category_posts(req, res, next) {
        try {
            const { id } = req.params;
            let { limit, page } = req.query;
            page = page || 1;
            limit = limit || 10;
            let offset = page * limit - limit;
            const posts = await Posts.findAll({ limit, offset, include: { model: Category, where: { id } } });
            return res.json(posts);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async create_category(req, res, next) {
        try {
            const { title, description } = req.body;
            if (!title || !description) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            const category = await Category.findAll({ where: { title } })
            if (category[0]) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            await Category.create({ title, description });
            return res.json({ message: "Create complete!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async update_category(req, res, next) {
        try {
            const { id } = req.params;
            const { title, description } = req.body;
            if (!title || !description) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            const category = await Category.update({ title, description }, { where: { id } });
            if (!category) {
                return next(ApiError.badRequest("Category does not exists!"));
            }
            return res.json({ message: "Category update complete!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async delete_category(req, res, next) {
        try {
            const { id } = req.params;
            await Category.destroy({ where: { id } });
            return res.json({ message: "Category deleted!" });
        } catch (error) {
            return next(ApiError.badRequest("Delete category error!"));
        }
    }
}

module.exports = new CategoriesController();