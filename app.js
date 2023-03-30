const express = require('express');
const usersRouter = require('./routes/user');
const dotenv = require('dotenv').config()

const app = express();

app.use(express.json());

app.use('/user', usersRouter);

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
