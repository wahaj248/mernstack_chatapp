const UserModel = require("../models/UserModel");

async function userDetails(req, res) {
    try {
        const userId = req.user._id || ""

        const user = await UserModel.findById(userId).select('-password');

        return res.status(200).json({
            message: "user details",
            data: user
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        })
    }
}

module.exports = userDetails