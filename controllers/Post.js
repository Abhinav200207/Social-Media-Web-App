const Post = require('../model/Post');
const User = require('../model/User');

exports.createPost = async (req, res) => {
    try {
        const post = await Post.create({
            caption: req.body.caption,
            image: {
                public_id: "req.body.public_id",
                url: req.body.image.url
            },
            owner: req.user._id
        });

        const user = await User.findById(req.user._id);

        user.posts.push(post._id);
        await user.save();

        res.status(201).json({
            success: true,
            post: post
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}


exports.likeUnlikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }

        if (post.likes.includes(req.user._id)) {
            const index = post.likes.indexOf(req.user._id);

            post.likes.splice(index, 1);

            await post.save();

            res.status(200).json({
                success: true,
                message: "Post Unliked"
            });
        } else {
            post.likes.push(req.user._id);

            await post.save();

            res.status(200).json({
                success: true,
                message: " Post Liked"
            })
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

exports.deletePost = async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return res.status(404).json({
            success: false,
            message: "Post not found"
        })
    }

    if (post.owner.toString() !== req.user._id.toString()) {
        res.statue(401).json({
            success: false,
            message: "Unauthorised"
        });
    }

    await post.remove();

    const user = await User.findById(req.user._id);
    const index = user.posts.indexOf(req.params.id);
    user.posts.splice(index, 1);
    user.save();

    res.status(200).json({
        success: true,
        message: "Post deleted successfully"
    })
}


exports.getPost = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const posts = await Post.find({
            owner: {
                $in: user.following,
            }
        }).populate("owner likes comments.user");

        res.json({
            success: true,
            posts:posts.reverse(),
        })
    } catch (error) {

    }
}

exports.updateCaption = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        post.caption = req.body.caption;
        await post.save();
        res.status(200).json({
            success: true,
            message: "Post updated",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

exports.commentPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        // console.log(post)

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        let comment_index = -1;

        post.comments.forEach((i, index) => {
            if (i.user.toString() === req.user._id.toString()) {
                comment_index = index;
            }
        });

        if (comment_index !== -1) {
            post.comments[comment_index].comment = req.body.comment;

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Comment Updated",
            });
        } else {
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment,
            });

            await post.save();
            return res.status(200).json({
                success: true,
                message: "Comment added",
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


// Need Testing
exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }

        // Checking If owner wants to delete

        if (post.owner.toString() === req.user._id.toString()) {
            if (req.body.commentId === undefined) {
                return res.status(400).json({
                    success: false,
                    message: "Comment Id is required",
                });
            }

            post.comments.forEach((item, index) => {
                if (item._id.toString() === req.body.commentId.toString()) {
                    return post.comments.splice(index, 1);
                }
            });

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Selected Comment has deleted",
            });
        } else {
            post.comments.forEach((item, index) => {
                if (item.user.toString() === req.user._id.toString()) {
                    return post.comments.splice(index, 1);
                }
            });

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Your Comment has deleted",
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};