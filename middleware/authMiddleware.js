const jwt =require("jsonwebtoken");

const isLoggedIn= async (req,res,next)=>{
    const {token}= req.cookies;

    if(!token){
         return next(new AppError("Unauthanticated,please login again.",401));
    }

    const userDetails=await jwt.verify(token,process.env.SCREATE);
    req.user=userDetails;
    next();
}

module.exports={
    isLoggedIn
}