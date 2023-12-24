const User = require('../models/user');
const jwt = require('jsonwebtoken');
const {UnauthenticatedError} = require('../errors');

const auth = async(req,res,next)=>{
    // check header
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        throw new UnauthenticatedError("Authentication invalid");
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token,process.env.JWT_SECRET);
        // attach user to job routes

        // const user = User.findById(payload.id).select('-password');// password not required in the req.user
        // req.user=user

        // above statment can be used as an alternate to the below one, but as there is not a functionality to remove the user in first place so we don't need to findById() for now
        req.user = {userId:payload.userId,name:payload.name};
        next();
    } catch (error) {
        throw new UnauthenticatedError("Authentication invalid");
    }
}
module.exports=auth;