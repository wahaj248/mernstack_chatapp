const jwt = require('jsonwebtoken');
const UserModel = require('../models/UserModel');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access token is missing or invalid' });
    }

    const decode = jwt.verify(token, process.env.JWT_SECREAT_KEY);

    const user = await UserModel.findById(decode.id).select('-password');
    if (!user) res.send(404).json({ message: "User not found" });

    req.user = user;
    next();
}

module.exports = authenticateToken;