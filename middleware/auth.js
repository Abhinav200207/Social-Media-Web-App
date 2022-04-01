const User = require('../model/User');
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
    try {
        const { accessToken } = req.cookies;
        // console.log(accessToken);
        if (!accessToken) {
            return res.status(401).json({
                message: "Login to continue"
            });
        }

        const data = jwt.verify(accessToken, process.env.JWT_SECREAT);

        req.user = await User.findById(data._id);

        next();
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}