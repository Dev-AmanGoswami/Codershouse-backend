require('dotenv').config(); // Makes all environment variables available
const express = require('express');
const cors = require('cors');
const app = express();
const DbConnect = require('./database');
const router = require('./routes');

const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000']
}
app.use(cors(corsOption));

const PORT = process.env.PORT || 5500;
DbConnect();
app.use(express.json());
app.use(router);


app.listen(PORT,() =>{
    console.log(`Listening on port ${PORT}`);
});