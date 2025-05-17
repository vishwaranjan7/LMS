const { Schema, model } = require("mongoose");
const bcrypt=require("bcryptjs")
const jwt=require("jsonwebtoken")
const crypto=require("crypto")

const userSchema = new Schema(
  {
    fullName: {
      type: "String",
      required: [true, "Name is required."],
      minLength: [5, "Name must be at least 5 charcter"],
      maxLength: [25, "Name's maximum length 25 charcter"],
      trim: true,
    },
    email: {
      type: "String",
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ],
    },
    password: {
      type: "String",
      required: [true, "Password is required."],
      minLength: [8, "Minimum length should be 8 charactar"],
      select: false,
    },
    avatar: {
      public_id: {
        type: "String",
      },
      secure_url: {
        type: "String",
      },
    },
    role: {
      type: "String",
      enum: ["USER", "ADMIN"],
      default: "USER",
    },

    forgetPasswordToken: String,
    forgetPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function(next){
    if(!this.isModified("passsword")){
        return next();
    }
    this.password= bcrypt.hash(this.password,10)
});

userSchema.methods={
    generateJWTToken:async function(){
        return jwt.sign({id:this._id,email:this.email,subscrition:this.subscrition,role:this.role},process.env.SCREATE,{
           expiresIn:process.env.JWT_EXPIRY
        })
    },

    comparePassword:async function(plainText){
        return await bcrypt.compare(plainText,this.password);
    },
    generatePasswordResetToken: async (req,res)=>{
        const resetToken= crypto.randomBytes(20).toString('hex');

        this.forgetPasswordToken=crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        this.forgetPasswordToken=Date.now()+ 15*60*1000; //15 min from now

        return resetToken;
    }

};

const User = model("User", userSchema);

module.exports = User;
