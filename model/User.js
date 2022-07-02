const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name"],
    },

    avatar: {
        public_id: String,
        url: String,
    },

    email: {
        type: String,
        required: [true, "Please enter an email"],
        unique: [true, "Email already exists"],
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },

    posts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
        },
    ],
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

userSchema.pre("save", async function (next) {
    if (this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

userSchema.methods.isPasswordMatched = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateToken = function(){
    return jwt.sign({_id:this._id},"45645643afjuhjialkcsiuanomf6585451acyignhlmjca3546685agchukjjhk356846")
}

module.exports = mongoose.model("User", userSchema);