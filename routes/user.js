const express = require("express");
const User = express.Router();
const Data = require("../controllers/User/userController");
const auth = require("../middleware/Auth");
const Insta = require("../controllers/instafeed");



User.route("/instagram-feed").get(Insta.getInstagramFeed )


// register
User.route("/register-user").post(Data.RegisterUser)
User.route("/register-user-by-pass").post(Data.Registeruserwithpassword)

// login
User.route("/login-user").post(Data.LoginUser)
User.route("/login-google-auth").post(Data.LoginUserwithGoogle)

// my profile
User.route("/my-profile").get(auth.IsAuthenticateUser, Data.myProfile)

// update
User.route("/update-user").put(auth.IsAuthenticateUser, Data.updateUser)

// delete user
User.route("/delete-user/:id").delete(auth.IsAuthenticateUser, Data.deleteUser)

// get all users
User.route("/get-all-users").get(auth.IsAuthenticateUser,auth.authorizeRole("admin"), Data.getAllUsers)

// get single user
User.route("/get-single-user/:id").get(auth.IsAuthenticateUser, Data.getSingleUser) 

// forget password
User.route("/forgot-password").post(Data.ForgotPassword)
// reset password with OTP
User.route("/reset-password-with-otp").post(Data.resetPasswordWithOTP)

// check otp
User.route("/check-otp").post(Data.checkOTP)


// admin
// send mail to all user
User.route("/send-mail-to-all-users").post(auth.IsAuthenticateUser,auth.authorizeRole("admin"),Data.sendEmailToAllUsers)

module.exports = User