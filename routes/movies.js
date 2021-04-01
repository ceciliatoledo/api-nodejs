const router = require('express').Router();
const request = require('request');
const checkToken = require('./checkToken');


//Get all movies
router.get('/get-movies', checkToken, (req,res) => {
    const URL_GET_KEYWORD_IDS = 'https://api.themoviedb.org/3/search/keyword?api_key='+process.env.MOVIE_DB_API_KEY+'&query='+req.body.keyword+'&page=1';
    const getIds = getKeywordIds(URL_GET_KEYWORD_IDS, ids => {
        const URL_GET_MOVIES_BY_KEYWORD =   'https://api.themoviedb.org/3/keyword/'+ids.toString()+'/movies?api_key='+process.env.MOVIE_DB_API_KEY+'&language=en-US&include_adult=false';
        const getMovies = getMoviesByKeyword(URL_GET_MOVIES_BY_KEYWORD, body =>{
            res.send({keyword: req.body.keyword, body});
        });
    });
});



const getKeywordIds = (reqURL, callback) => {
    request(reqURL, {json : true }, (err, res, body) => {
        if (err) 
            return callback(err);
        else {
            let ids = []
            for (i in body.results){
                ids.push(body.results[i].id);
            }
            return callback(ids);
        }
    });
};

const getMoviesByKeyword = (reqURL, callback) => {
    request(reqURL, {json : true }, (err, res, body) => {
        if (err) 
            return callback(err);
        else {
            // let ids = []
            // for (i in body.results){
            //     ids.push(body.results[i].id);
            // }
            return callback(body);
        }
    });
};

module.exports = router;