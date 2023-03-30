const db = require('../config/db');
const User_Profile = require('../models/users_profile.js');

exports.createUserProfile = async (user_info) => {
    try {
        const new_user = await User_Profile.create({ mail: user_info.mail, full_name: user_info.full_name });
        return new_user;
    } catch (err) {
        console.error('Kullanıcı Profili ekleme hatası:', err);
    }
};
