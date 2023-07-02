const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { User } = require('../models/models');

// Mail host example
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'reed.mclaughlin43@ethereal.email',
        pass: 'ZET74cNcFJCZ49YfYv'
    }
});

const send_mail = (path, email, jwt) => {
    transporter.sendMail({
        from: '"Node js" <nodejs@example.com>',
        to: email,
        subject: 'Message from Node js',
        text: "",
        html: `
        <div>
            <h1>Activation link:</h1>
            <a href="http://127.0.0.1:${process.env.PORT}/api/auth/${path}/${jwt}" target="_blank">click to confirm</a>
        </div>
        `,
    });
}

const generateJwt = (id, login, role) => {
    return jwt.sign({ id, login, role },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
}

class AuthController {
    async register(req, res, next) {
        try {
            const { login, password, password_conf, email, full_name } = req.body;
            let { role } = req.body;
            console.log(req.body)
            if (req.user?.role && req.user?.role != 'ADMIN') {
                role = 'USER';
            }
            if (!login || !password || !password_conf || !email) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            if (password !== password_conf) {
                return next(ApiError.badRequest("Подтвердите пароль!"));
            }
            if (await User.findOne({ where: { login } }) || await User.findOne({ where: { email } })) {
                return next(ApiError.badRequest("Пользователь уже существует!"));
            }
            const hashPassword = await bcrypt.hash(password, 5);
            let user = await User.create({ login, password: hashPassword, full_name, email, role });
            send_mail('register', user.email, generateJwt(user.id, '', ''));
            return res.json({ message: "Registration complete, check email!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async login(req, res, next) {
        try {
            const { login, password, email } = req.body;
            if (!login || !password || !email) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            const user = await User.findOne({ where: { login, email } });
            if (!user) {
                return next(ApiError.badRequest("Пользователь не найден!"));
            }
            if (!bcrypt.compareSync(password, user.password)) {
                return next(ApiError.badRequest("Неверные данные!"));
            }
            if (user.confirm == true) {
                const jwt_token = generateJwt(user.id, user.login, user.role);
                res.cookie('token', jwt_token, {
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    sameSite: 'None'
                });
                return res.json({ jwt_token, login: user.login, role: user.role, profile_picture: user.profile_picture, rating: user.rating, id: user.id });
            }
            return next(ApiError.badRequest("Check email!"));
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async email_confirm(req, res) {
        try {
            const { token } = req.params;
            const { id } = jwt.verify(token, process.env.SECRET_KEY);
            const user = await User.update({ confirm: true }, { where: { id } });
            if (!user) return next(ApiError.badRequest("User not confirm"));
            return res.json({ message: "Account verified!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie('token', {
                secure: true,
                httpOnly: true,
                sameSite: 'None'
            });
            return res.json({ message: "Logout complete!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async password_reset(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            const user = await User.findOne({ where: { email } });
            if (!user) {
                return next(ApiError.badRequest("Некорректное поле!"));
            }
            send_mail('password-reset', user.email, generateJwt(user.id, '', ''));
            return res.json({ message: "Check email!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async password_confirm(req, res) {
        try {
            const { new_password } = req.body;
            const { token } = req.params;
            const { id } = jwt.verify(token, process.env.SECRET_KEY);
            const hashPassword = await bcrypt.hash(new_password, 5);
            const user = await User.update({ password: hashPassword }, { where: { id } });
            if (!user) return next(ApiError.badRequest("User does not exists"));
            return res.json({ message: "Password changed!" });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal("Server error! Try again later!"));
        }
    }

    async check(req, res, next) {
        const token = req.cookies.token;
        if (!token) return res.status(403).json({ message: "Не авторизирован!" });
        const { id, login, role } = jwt.verify(token, process.env.SECRET_KEY);
        res.clearCookie('token', { httpOnly: true, sameSite: 'None', secure: true });
        let user = await User.findOne({ where: { id } });
        const jwt_token = generateJwt(
            id,
            login,
            role
        );
        res.cookie("token", token, {
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: 'None'
        }); //24h
        return res.json({ jwt_token, login: user.login, role: user.role, profile_picture: user.profile_picture, rating: user.rating, id: user.id });
    }
}

module.exports = new AuthController();