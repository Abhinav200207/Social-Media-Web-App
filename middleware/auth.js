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

        const data = jwt.verify(accessToken, "45645643afjuhjialkcsiuanomf6585451acyignhlmjca3546685agchukjjhk356846");

        req.user = await User.findById(data._id);

        next();
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}