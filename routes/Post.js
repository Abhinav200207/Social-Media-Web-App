const express = require('express');
const { createPost, temporaryPost, likeUnlikePost, deletePost, getPost, updateCaption, commentPost, deleteComment } = require('../controllers/Post');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.route("/post/upload").post(isAuthenticated, createPost);


router.route("/post/:id")
    .get(isAuthenticated, likeUnlikePost)
    .delete(isAuthenticated, deletePost)
    .put(isAuthenticated, updateCaption);

router.route("/posts").get(isAuthenticated, getPost);
router.route("/post/comment/:id").put(isAuthenticated,commentPost).delete(isAuthenticated, deleteComment);


module.exports = router;