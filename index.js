const express = require('express');
const app = express();
const port = 3000;

//Routes
const registerRoute = require('./routes/register');

//Middleware
app.use(express.json());

app.use('/user', registerRoute);

app.listen(port, () => console.log("App listening on port " + port))