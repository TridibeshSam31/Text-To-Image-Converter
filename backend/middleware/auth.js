import jwt from 'jsonwebtoken';


const userAuth = async (req, res,next) => {
    let {token} = req.headers;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token){
        return res.json({sucess:false , message: 'Not Authorized Login Again'});
    }
    try {
        const tokenDecode = jwt.verify(token,process.env.JWT_SECRET);
        if (tokenDecode.id) {
            req.userId = tokenDecode.id;
            if (!req.body) req.body = {};
            req.body.userId = tokenDecode.id;
            req.body.userID = tokenDecode.id;
        }else{
            return res.json({sucess:false , message: 'Not Authorized Login Again'});
        }
        next();
    } catch (error) {
         return res.json({sucess:false , message:error.message});
    }


};

export default userAuth;