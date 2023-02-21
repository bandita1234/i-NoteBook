var jwt = require('jsonwebtoken');
const JWT_SECRET = "hello.there.bandita.here";

const fetchUser = (req,res,next) => {
    //Get the user from the jwt token and add id to req object
    const token = req.header('auth-token'); //get the token(name-"auth-token") from the header
    if(!token){
        res.status(401).send({Error : "Please authenticate with a valid token!"});
    }

    try{
        //If present,verify the token with the secret
        const data = jwt.verify(token,JWT_SECRET);
        req.user = data.user; //Got the user!
        next();
    }catch(error){
        res.status(401).send({Error : "Please authenticate with a valid token!"});
    }
}

module.exports = fetchUser;