const User = require("../model/User");
const Post = require('../model/Post');

const options = {
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    httpOnly: true
}

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        let user = await User.findOne({ email: email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: "public_id",
                url: "public_url"
            }
        });

        const token = await user.generateToken();

        res.status(201).cookie("accessToken", token, options).json({
            success: true,
            user,
            token
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            res.status(400).json({
                success: false,
                message: "invalid email"
            });
        }

        const isTrue = await user.isPasswordMatched(password);

        if (!isTrue) {
            res.status(400).json({
                success: false,
                message: "incorrect password bruh"
            });
        }

        const token = await user.generateToken();

        res.status(201).cookie("accessToken", token, options).json({
            success: true,
            user,
            token
        });


    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.followUser = async (req, res) => {

    try {
        const usertobefollowed = await User.findById(req.params.id);
        const userbywhichtobefollowed = await User.findById(req.user._id);


        if (!usertobefollowed) {
            res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        if (userbywhichtobefollowed.following.includes(req.params.id)) {
            const index1 = userbywhichtobefollowed.following.indexOf(req.params.id);
            const index2 = usertobefollowed.followers.indexOf(req.user._id);

            userbywhichtobefollowed.following.splice(index1, 1);
            usertobefollowed.followers.splice(index2, 1);

            await userbywhichtobefollowed.save();
            await usertobefollowed.save();

            res.status(200).json({
                success: true,
                message: "User unfollowed sucessfully"
            });
        } else {
            usertobefollowed.followers.push(req.user._id);
            userbywhichtobefollowed.following.push(req.params.id);

            userbywhichtobefollowed.save();
            usertobefollowed.save();

            res.status(200).json({
                success: true,
                message: "User followed sucessfully"
            });
        }
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.logoutUser = async (req, res) => {
    try {
        res.status(200).cookie("accessToken", null, { expires: new Date(Date.now()), httpOnly: true }).json({
            success: true,
            message: "Successfully logged out"
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("+password");

        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide old and new password",
            });
        }

        const isMatch = await user.isPasswordMatched(oldPassword);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Old password",
            });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password Updated",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        const { name, email } = req.body;

        if (name) {
            user.name = name;
        }
        if (email) {
            user.email = email;
        }

        // profile pic change

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile Updated sucessfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

exports.deleteMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const posts = user.posts;
        const followers = user.followers;
        const following = user.following;
        const userId = user._id;


        await user.remove();

        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
        });

        for (let i = 0; i < posts.length; i++) {
            const post = await Post.findById(posts[i]);
            await post.remove();
        }

        for (let i = 0; i < followers.length; i++) {
            const follower = await User.findById(followers[i]);

            const index = follower.following.indexOf(userId);
            follower.following.splice(index, 1);
            await follower.save();
        }

        for (let i = 0; i < following.length; i++) {
            const follows = await User.findById(following[i]);

            const index = follows.followers.indexOf(userId);
            follows.followers.splice(index, 1);
            await follows.save();
        }

        const allPosts = await Post.find();

        for (let i = 0; i < allPosts.length; i++) {
            const post = await Post.findById(allPosts[i]._id);

            for (let j = 0; j < post.comments.length; j++) {
                if (post.comments[j].user === userId) {
                    post.comments.splice(j, 1);
                }
            }
            await post.save();
        }

        for (let i = 0; i < allPosts.length; i++) {
            const post = await Post.findById(allPosts[i]._id);

            for (let j = 0; j < post.likes.length; j++) {
                if (post.likes[j] === userId) {
                    post.likes.splice(j, 1);
                }
            }
            await post.save();
        }

        res.status(200).json({
            success: true,
            message: "Profile Deleted sucessfully",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

exports.myProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id) //.populate("posts followers following");

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate(
            "posts followers following"
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({
            name: { $regex: req.query.name, $options: "i" },
        });

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};


