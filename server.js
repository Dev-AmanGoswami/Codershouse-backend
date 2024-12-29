require('dotenv').config(); // Makes all environment variables available
const express = require('express');
const cors = require('cors');
const app = express();
const DbConnect = require('./database');
const cookieParser = require('cookie-parser');
const router = require('./routes');

app.use(cookieParser());
const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000']
}
app.use(cors(corsOption));

const PORT = process.env.PORT || 5500;
DbConnect();
// Setting the limit for the body data size
app.use(express.json({
    limit: '8mb'
}));
app.use(router);


app.listen(PORT,() =>{
    console.log(`Listening on port ${PORT}`);
});