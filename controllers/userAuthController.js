const bcrypt = require('bcryptjs');
const asynchandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const UserAuth = require('../models/user_auth.js');
const User = require('../models/user.js');
const UserController = require('./userController.js');

const create_token = (id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
})

const create_verify_token = (id => {
    return jwt.sign({ id }, process.env.MAIL_JWT_SECRET, {
        expiresIn: '1d'
    })
})

const sendVerificationEmail = (email, id) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.MAIL_ADRESS,
            pass: process.env.MAIL_PASSWORD
        }
    });
    const verify_token = create_verify_token(id);
    const mailOptions = {
        from: process.env.MAIL_ADRESS,
        to: email,
        subject: 'Account Verification',
        text: `E-postanızı doğrulamak için tıklayın: http://localhost:3000/user/verify-mail/${verify_token}`
    };
    console.log(mailOptions);
    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
}

const createUser = asynchandler(async (req, res) => {
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

        const userNameControl = await UserAuth.findOne({ where: { user_name: user_name, } });

        if (userNameControl) {
            res.status(200).json(
                {
                    status_code: 200,
                    succes: false,
                    message: "Bu kullanıcı adı zaten kullanılıyor."
                }
            );
            return;
        }

        const userMailControl = await UserAuth.findOne({ where: { mail: mail, } });

        if (userMailControl) {
            res.status(200).json(
                {
                    status_code: 200,
                    succes: false,
                    message: "Bu e-posta zaten kullanılıyor."
                }
            );
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const secretPassword = await bcrypt.hash(password, salt);
        const userAuth = {
            user_name: user_name,
            password: secretPassword,
            mail: mail
        };

        UserAuth.create(userAuth)
            .then((new_user) => {
                UserController.createUserProfile({
                    auth_id: new_user.dataValues.id,
                    full_name: full_name
                });
                sendVerificationEmail(new_user.dataValues.mail, new_user.dataValues.id)
                res.status(200).json(
                    {
                        status_code: 200,
                        succes: true,
                        message: "Hesabınız başarıyla oluşturuldu. Lütfen e-postanızı doğrulayın."
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
            });
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

const verifyMail = asynchandler(async (req, res) => {
    const token = req.params.token;
    if (token) {
        try {
            const token_encoded = jwt.verify(token, process.env.MAIL_JWT_SECRET);
            const verify_user = await UserAuth.findByPk(token_encoded.id);
            verify_user.mail_verify = true;
            verify_user.save();
            res.status(200).json(
                {
                    status_code: 200,
                    succes: false,
                    message: "E-posta Doğrulandı."
                }
            );
        }
        catch (error) {
            res.status(500).json(
                {
                    status_code: 500,
                    succes: false,
                    message: "Sunucu taraflı bir sorun oluştu."
                }
            );
            return;
        }
    }
    else {

        res.status(400).json(
            {
                status_code: 400,
                succes: false,
                message: "Erişim için yetkiniz yok."
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
        const user = await UserAuth.findOne({
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
            attributes: ['id', 'full_name', 'biography', 'updated_at'],
            include: { model: UserAuth, attributes: ['user_name', 'mail', 'created_at', 'updated_at'] }
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
    verifyMail,
    getUsers,
    getUserById
}