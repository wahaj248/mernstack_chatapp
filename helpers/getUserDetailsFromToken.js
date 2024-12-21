const jwt = require('jsonwebtoken')
const UserModel = require('../models/UserModel')

const getUserDetailsFromToken = async(socket, token)=>{
    
    if(!token){
        return {
            message : "session out",
            logout : true,
        }
    }

    const decode = jwt.verify(token,process.env.JWT_SECREAT_KEY);

    const user = await UserModel.findById(decode.id).select('-password');
    socket.data.user = user;
    return user;
}

module.exports = getUserDetailsFromToken;