const bcrypt = require('bcryptjs');
const asynchandler = require('express-async-handler');
const jwt = require('jsonwebtoken');

const User = require('../models/users.js');
const User_Profile = require('../models/users_profile.js');
const UserProfileController = require('./userProfileController');

const create_token = (id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
})


const createUser = asynchandler(async (req, res,) => {
    try {
        const { user_name, password, mail, full_name } = req.body;

        if (!user_name || !password || !mail || !full_name) {
            res.status(400).json(
                {
                    status_code: 400,
                    succes: false,
                    message: "Kayıt olurken zorunlu alanları girmeyi atlamayınız."
                }
            );
            return;
        }

        const userName = await User.findOne({ where: { user_name: user_name } });

        if (userName) {
            res.status(200).json(
                {
                    status_code: 200,
                    succes: false,
                    message: "Bu kullanıcı adı zaten kullanılıyor."
                }
            );
            return;
        }

        const userMail = await User_Profile.findOne({ where: { mail: mail } });

        if (userMail) {
            res.status(200).json(
                {
                    status_code: 200,
                    succes: false,
                    message: "Bu e-posta zaten kullanılıyor."
                }
            );
            return;
        }

        const profile_id = await UserProfileController.createUserProfile({
            mail: mail,
            full_name: full_name
        });
        if (profile_id.dataValues.id) {
            const salt = await bcrypt.genSalt(10);
            const secretPassword = await bcrypt.hash(password, salt);
            const user = {
                user_name: user_name,
                password: secretPassword,
                profile_id: profile_id.dataValues.id
            };
            User.create(user)
                .then((new_user) => {
                    res.status(200).json(
                        {
                            status_code: 200,
                            succes: true,
                            message: "Hesabınız başarıyla oluşturuldu. Lütfen giriş yapın."
                        }
                    );
                    return;
                })
                .catch((err) => {
                    console.log("Hesap oluşturulken hata : ", err)
                    res.status(200).json(
                        {
                            status_code: 200,
                            succes: false,
                            message: "Hesabınız oluşturulurken bir hata oluştu."
                        }
                    );
                    return;
                })
        }
    } catch (err) {
        console.error('Kullanıcı ekleme hatası:', err);
        res.status(500).json(
            {
                status_code: 500,
                succes: false,
                message: "Sunucu taraflı bir sorun oluştu."
            }
        );
        return;
    }
});

// user login
const userLogin = asynchandler(async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).json(
                {
                    status_code: 400,
                    succes: false,
                    message: "Lütfen bilgilerinizi eksiksiz girin."
                }
            );
            return;
        }
        const user = await User.findOne({
            include: { model: User_Profile, attributes: ['mail', 'full_name', 'biography', 'updated_at'] },
            where: { user_name: username }
        });

        if (user && (await bcrypt.compare(password, user.password))) {
            user.dataValues.token = create_token(user.id);
            delete user.dataValues.password;
            res.status(200).json(
                {
                    status_code: 200,
                    succes: true,
                    data: user
                }
            )
        }
        else {
            res.status(200).json(
                {
                    status_code: 200,
                    succes: false,
                    message: 'Kullanıcı adınız veya şifreniz hatalı, Lütfen tekrar kontrol ediniz.'
                }
            );
            return;
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(
            {
                status_code: 500,
                succes: false,
                message: "Sunucu taraflı bir sorun oluştu."
            }
        )
    }
})

const getUsers = asynchandler(async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'user_name', 'created_at', 'updated_at'],
            include: { model: User_Profile, attributes: ['mail', 'full_name', 'biography', 'updated_at'] }
        });
        res.status(200).json(
            {
                status_code: 200,
                succes: true,
                data: users
            }
        );
    } catch (err) {
        console.error('Kullanıcıları listeleme hatası:', err);
        res.status(500).json(
            {
                status_code: 500,
                succes: false,
                message: "Sunucu taraflı bir sorun oluştu."
            }
        );
    }
});

const getUserById = asynchandler(async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findByPk(id, {
            attributes: ['id', 'user_name', 'created_at', 'updated_at'],
            include: { model: User_Profile, attributes: ['mail', 'full_name', 'biography', 'updated_at'] }
        });
        res.status(200).json(
            {
                status_code: 200,
                succes: true,
                data: user
            }
        );
    } catch (err) {
        console.error('Kullanıcı bilgisi hatası:', err);
        res.status(500).json(
            {
                status_code: 500,
                succes: false,
                message: "Sunucu taraflı bir sorun oluştu."
            }
        );
    }
});

module.exports =
{
    userLogin,
    createUser,
    getUsers,
    getUserById
}