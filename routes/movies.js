const router = require('express').Router();
const checkToken = require('./checkToken');

//Get all movies
router.get('/getMovies', checkToken, (req,res) => {

});

module.exports = router;