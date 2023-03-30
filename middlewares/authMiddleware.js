const jwt = require('jsonwebtoken')
const User = require('../models/users.js');
const asyncHandler = require('express-async-handler')

const tokenControl = asyncHandler(async (req, res, next) => {
    let encryptedToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            encryptedToken = req.headers.authorization.split(' ')[1];
            const token = jwt.verify(encryptedToken, process.env.JWT_SECRET);
            req.user = await User.findByPk(token.id);
            next()
        }
        catch (error) {
            res.status(400)
            throw new Error('Token işlenirken bir hata oluştu.')
        }
    }

    if (!encryptedToken) {
        res.status(400)
        throw new Error('Erişim için yetkiniz yok.')
    }

})


module.exports = {
    tokenControl
}