const mongoose = require('mongoose');

exports.connectDatabase = () => {
    console.log("Yahan tak aareha hai bhai");
    return mongoose.connect(process.env.MONGO_URI).then((data) => {
        console.log(`Connected to MongoDB database ${data}`);
    }).catch((err) => {
        console.log(`ERROR!!!! connecting to MongoDB database ${err.message}`);
    });
}