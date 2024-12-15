require('dotenv').config(); // Makes all environment variables available
const express = require('express');
const app = express();
const router = require('./routes');

const PORT = process.env.PORT || 5500;
app.use(express.json());
app.use(router);


app.listen(PORT,() =>{
    console.log(`Listening on port ${PORT}`);
});