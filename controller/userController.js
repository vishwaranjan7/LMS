const User = require("../model/userModel");
const AppError = require("../util/errorUtil");
const cloudinary=require("cloudinary");
const fs=require("fs/promises");
const sendEmail = require('../util/sendEmail');
const crypto=require("crypto")
const cookieOption = {
  maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  httpOnly: true,
  secure: true,
};

const register = async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    return next(new AppError("All files are required.", 400));
  }

  const userExists = await User.findOne({ email }).select("+password");
  if (userExists) {
    return next(new AppError("User already exists.", 400));
  }

  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url:
        "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg",
    },
  });

  if (!user) {
    return next(new AppError("User registration faild,Please try again.", 400));
  }

  // todo: file upload

  console.log("File details>",JSON.stringify(req.file));
  if(req.file){
    
    try {
        const result= await cloudinary.v2.uploader.upload(req.file.path,{
            folder:'lms',
            width:250,
            height:250,
            gravity:'faces',
            crop:"fill"
        });

        if(result){
            user.avatar.public_id=result.public_id;
            user.avatar.secure_url=result.secure_url;

            // remove file from server
            
            fs.rm(`uploads/${req.file.filename}`);

        }
    } catch (error) {
        
        return next(new AppError(error||"file not uploaded,please try again" ,500));
    }

  }

  await user.save();

  user.password = undefined;

  const token = await user.generateJWTToken();

  res.cookie("token", token, cookieOption);

  res.status(201).json({
    success: true,
    message: "User registered successfully.",
    user,
  });
};

const login = async (req, res,next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("All files are required.", 401));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!email || !user.comparePassword(password)) {
      return next(new AppError("Email or password does not match.", 401));
    }

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie("token", token, cookieOption);

    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      user,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

const logout = (req, res) => {
  res.cookie("token", null, {
    secure: true,
    maxAge: 0,
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully.",
  });
};

const getProfile = async (req, res,next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      message: "User details",
      user,
    });
  } catch (error) {
    next(new AppError("Faild to fetch profile data", 401));
  }
};

const forgetPassword= async(req,res,next)=>{
    const {email}=req.body;

    if(!email){
        next(new AppError("Fill the required fields.", 400));
    }

    const user= await User.findOne({email});

    if(!user){
        return next(new AppError("Email is not registered.", 400));
    }

    const resetToken= await user.generatePasswordResetToken();

    await user.save();
    const resetPasswordUrl= `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      // We here need to send an email to the user with the token
  const subject = 'Reset Password';
  const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;
  console.log(message);
  
   try {
      await sendEmail(email,subject,message);

      res.status(200).json({
        success:true,
        message:`Reset password token has been sent to ${email} successfully `
      })
   } catch (error) {
      user.forgetPasswordExpiry=undefined;
      user.forgetPasswordToken=undefined;
      await user.save();
      return next(new AppError(error.message, 500));
   }
  }

const resetPassword= async(req,res,next)=>{

    const {resetToken}= req.params;
    const {password}= req.body;

    const forgetPasswordToken= crypto
    .createHash("sha256")
    .update(resetToken)
    .digest('hex')

    const user= await User.findOne({
      forgetPasswordToken,
      forgetPasswordExpiry:{$gt:Date.now()}
    });

    if(!user){
      return next(new AppError("Token is invalid or expired, please try again", 500));
    }

    user.password=password;
    user.forgetPasswordToken=undefined;
    user.forgetPasswordExpiry=undefined;
    user.save();

    res.status(200).json({
      success:true,
      message:"Password changed successfully."
    })
}



module.exports = { register, login, logout, getProfile,forgetPassword,resetPassword };
