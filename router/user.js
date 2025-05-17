const router=require("express").Router();
const{ register, login, logout, getProfile, forgetPassword, resetPassword }=require("../controller/userController");
const { isLoggedIn } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerMiddleware");

router.post("/register",upload.single("avatar"),register)
router.post("/login",login)
router.get("/logout",logout)
router.get("/me",isLoggedIn,getProfile)
router.post("/forget-password",forgetPassword)
router.post("/reset-password",resetPassword)

module.exports=router;