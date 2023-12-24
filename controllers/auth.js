const User = require('../models/user');
const {StatusCodes} = require('http-status-codes');
const{BadRequestError,UnauthenticatedError} = require('../errors');
// const bcrypt = require('bcryptjs'); -> not reqd. now as the hashing is done using the mongoose middleware now
const jwt = require('jsonwebtoken');

// passing the string password directly to the database is not a good practice, as if someone breaks throught the database then it will be problem for the user
// so to solve this we hash the password using library bcryptjs
const register = async(req,res)=>{
    // creating a separate user object instead (tempUser)
    /*const {name,email,password}=req.body;
    const salt = await bcrypt.genSalt(10);// generates sort of random bytes where have passed rounds to be 10
    const hashedPassword =await bcrypt.hash(password,salt);
    // as the hash created value will be of large length than the maxlength:12, so we need to remove that validator
    const tempUser ={name,email,password:hashedPassword};*/

    const user = await User.create({... req.body});
    // const token = jwt.sign({userId : user._id,name:user.getName()},'jwtSecret',{expiresIn:'30d'});
    const token = user.createJWT();// creating token using instance method

    // the token can be decoded in frontend using diff. techniques that's why we don't send password in the payload
    // now in my frontend along with the token I may want to send the name also
    res.status(StatusCodes.CREATED).json({user :{name :user.name},token});//201
}

const login = async(req,res)=>{
    const {email,password} =req.body;
    //  if we don't use the below statement anyways the error will be thrown further, but to handle it in a clean way this is a good practice
    if(!email || !password){
        throw new BadRequestError("Please provide email id and password");
    }
    
    const user = await User.findOne({email}); // findOne() is promise returning so use async/await
    if(!user){
        throw new UnauthenticatedError("Invalid Credentials");
    }
    
    //compare password
    const isPasswordCorrect = await user.comparePassword(password);
    if(!isPasswordCorrect){
        throw new UnauthenticatedError("Invalid credentials");
    }

    const token = user.createJWT();
    // in my frontend I may require some extra things, that extra thing here is user.name
    res.status(StatusCodes.OK).json({name:user.name,token});//200
}

module.exports ={register,login};