const express = require('express');
const { register, login, followUser, logoutUser, getMyPosts, changePassword, updateProfile, deleteMyProfile, myProfile, getUserProfile, getAllUsers } = require('../controllers/User');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.route("/register").post(register);


router.route("/login").post(login);
router.route("/logout").get(logoutUser);


router.route("/follow/:id").get(isAuthenticated, followUser);
router.route("/update/password").put(isAuthenticated, changePassword);
router.route("/update/profile").put(isAuthenticated, updateProfile);
router.route("/delete/me").delete(isAuthenticated, deleteMyProfile); //////
router.route("/myProfile").get(isAuthenticated, myProfile);
router.route("/user/:id").get(isAuthenticated, getUserProfile);
router.route("/users").get(isAuthenticated, getAllUsers); //////
router.route("/my/posts").get(isAuthenticated, getMyPosts);


module.exports = router;