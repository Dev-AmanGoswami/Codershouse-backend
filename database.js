const mongoose = require('mongoose');

const DbConnect = () => {
    const DB_URL = process.env.DB_URL;
    mongoose.connect(DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on('error', console.error.bind(console,'Connection error: '));
    db.once('open', () => {
        console.log("DB connected...");
    });
}

module.exports = DbConnect;