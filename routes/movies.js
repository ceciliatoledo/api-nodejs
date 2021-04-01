const router = require('express').Router();
const request = require('request');
const checkToken = require('./checkToken');


/* Get movies by keyword
*  Given a keyword or query, it searches for every movie related to it,
*  gives them an arbitrary suggestionScore between 0 and 99, and returns them
*  ordered by said score. 
*/
router.get('/get-movies-by-keyword', checkToken, (req,res) => {
    const URL = 'https://api.themoviedb.org/3/search/movie?api_key='+process.env.MOVIE_DB_API_KEY+'&language=en-US&query='+encodeURI(req.body.keyword)+'&page=1&include_adult=false';
    const getMovies = getMoviesByKeyword(URL, body => {  
        for (movie in body.results) {
            body.results[movie].suggestionScore = getRandomArbitrary(0,99);
        }
        body.results.sort(function (a, b) {
            if (a.suggestionScore <= b.suggestionScore){
                return -1;
            } else {
                return 1;
            } 
        })
        res.send({keyword: req.body.keyword, body});
    });
});

const getMoviesByKeyword = (URL, callback) => {
    request(URL, {json : true }, (err, res, body) => {
        if (err) 
            return callback(err);
        else {
            return callback(body);
        }
    });
};

const getRandomArbitrary = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

module.exports = router;