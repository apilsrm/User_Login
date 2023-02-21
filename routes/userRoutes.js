const express = require("express");
const { register, login } = require("../controllers/userController");
const singleUpload = require("../middlewares/multer");
// const createUser = require("../controllers/userController");
const router = express.Router();

//register User Routes
router.route("/register").post(singleUpload, register);

//login routers
router.route("/login").post(login);

//update profile routes
router.route("/profile/update").put(auth, singleUpload, profileUpdate);
//change password
router.route("/change/password").put(auth, changePassword);
//get logged user
router.route("/me").get(auth, singleUser);
//for admin routes
router.route("/all/user").get(auth, isAuthAdmin, getAllUsers);
//for single user only admin can get
router.route("/single/user/:id").get(auth, isAuthAdmin, getSingleUserByAdmin);
//for delete single user by admin only
router.route("/delete/user/:id").delete(auth, isAuthAdmin, deleteSingleUser);

module.exports = router;
