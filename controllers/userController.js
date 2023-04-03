const db = require('../config/db');
const User = require('../models/user.js');

exports.createUserProfile = async (user_info) => {
    try {
        const new_user = await User.create(user_info);
        return new_user;
    } catch (err) {
        console.error('Kullanıcı Profili ekleme hatası:', err);
    }
};
