const sequelize = require('../db');
const { DataTypes } = require('sequelize');

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    login: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    full_name: {type: DataTypes.STRING, defaultValue: ""},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    profile_picture: {type: DataTypes.STRING, defaultValue: "default.jpg"},
    rating: {type: DataTypes.INTEGER, defaultValue: 0},
    role: {type: DataTypes.ENUM('USER', 'ADMIN'), defaultValue: "USER"},
    confirm: {type: DataTypes.BOOLEAN, defaultValue: false}
});

const Posts = sequelize.define('posts', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    status: {type: DataTypes.BOOLEAN, defaultValue: true},
    content: {type: DataTypes.TEXT, allowNull: false},
    status: {type: DataTypes.BOOLEAN, defaultValue: true}
});

const Category = sequelize.define('category', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false, unique: true},
    description: {type: DataTypes.STRING, allowNull: false}
});

const PostCategory = sequelize.define('post_category', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}
});

const Comment = sequelize.define('comment', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    content: {type: DataTypes.STRING, allowNull: false},
    status: {type: DataTypes.BOOLEAN, defaultValue: true}
});

const PostLike = sequelize.define('post_like', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    like_type: {type: DataTypes.ENUM('like', 'dislike'), allowNull: false}
});

const CommentLike = sequelize.define('comment_like', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    like_type: {type: DataTypes.ENUM('like', 'dislike'), allowNull: false}
});


User.hasMany(Posts);
Posts.belongsTo(User);

User.hasMany(Comment);
Comment.belongsTo(User);

User.hasMany(PostLike);
PostLike.belongsTo(User);

User.hasMany(CommentLike);
CommentLike.belongsTo(User);

Posts.belongsToMany(Category, {through: PostCategory});
Category.belongsToMany(Posts, {through: PostCategory});

Posts.hasMany(PostLike);
PostLike.belongsTo(Posts);

Posts.hasMany(Comment);
Comment.belongsTo(Posts);

Comment.hasMany(CommentLike);
CommentLike.belongsTo(Comment);

module.exports = {
    User,
    Posts,
    Category,
    PostCategory,
    Comment,
    PostLike,
    CommentLike
}
