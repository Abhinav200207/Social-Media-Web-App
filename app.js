const express = require('express');
const app = express();
const post = require('./routes/Post');
const user = require('./routes/user');
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config({ path: 'backend/config/config.env' });
}

app.use("/api/v1",post);
app.use("/api/v1",user);

module.exports = app;
