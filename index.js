const express = require('express');
const app = express();
const dotenv = require('dotenv');
const port = 3000;

dotenv.config();

//Routes
const authRoute = require('./routes/auth');
const moviesRoute = require('./routes/movies');

//Middleware
app.use(express.json());

app.use('/user', authRoute);
app.use('/movies', moviesRoute);

app.listen(port, () => console.log("App listening on port " + port))