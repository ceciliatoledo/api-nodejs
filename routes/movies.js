const router = require('express').Router();
const request = require('request');
const checkToken = require('./checkToken');
fs = require('fs');


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

router.post('/add-movie-to-favourites', checkToken, (req,res) =>{
    fs.readFile('./favourites.txt', (err, data) => {
        if (err){
            console.log('Error reading file', err);
        } else {
            try {
                let favouritesData = JSON.parse(data);
                let userFavourites = findFavourites(favouritesData, req.user.email);
                if (userFavourites == null){
                    insertNewUserAndFavourites(favouritesData, req.user.email, req.body);
                } else {
                    insertNewFavourite(favouritesData, req.user.email, req.body);
                }
                res.status(201).send('Successfully added movie to your favourites list!')
            } catch (err) {
                console.log('Error parsing data', err);
            }
        }
            
    });
});



//Utils 
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

const findFavourites = (favouritesData, email) => {
    return favouritesData.find(entry => entry.email == email);
}

// The first time the user adds movies to the list
const insertNewUserAndFavourites = (favouritesData, email, movie) => {
    movie.addedAt = formattedDate();
    favouritesData[favouritesData.length] = { email: email, favourites: [movie]};
    fs.writeFile('./favourites.txt', JSON.stringify(favouritesData, null, 2), (err) => {
        if (err)
            console.log('Error writing file', err);
    });
}

// The user had previousley added favourite movies to the list
const insertNewFavourite = (favouritesData, email, movie) => {
    let userFavourites = findFavourites(favouritesData, email);
    // TODO: CHECK IF THE MOVIE IS ALREADY IN THE LIST
    movie.addedAt = formattedDate();
    userFavourites.favourites[userFavourites.favourites.length] = movie;
    fs.writeFile('./favourites.txt', JSON.stringify(favouritesData, null, 2), (err) => {
        if (err)
            console.log('Error writing file', err);
    })
}

const formattedDate = () =>{
    let datetime = new Date();
    let date = ("0" + datetime.getDate()).slice(-2);
    let month = ("0" + (datetime.getMonth() + 1)).slice(-2);
    let year = datetime.getFullYear();
    return year + "-" + month + "-" + date;
}


module.exports = router;