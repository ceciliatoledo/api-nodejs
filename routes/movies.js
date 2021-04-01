const router = require('express').Router();
const request = require('request');
const checkToken = require('./checkToken');
fs = require('fs');


/* Get movies
*  If the user enters a keyword, the response returns every movie related to it. If 
*  the request is empty, it returns the first page of all the movies from the movie db.
*  It also adds a field with an arbitrary suggestionScore between 0 and 99, and returns the movie list
*  ordered by said score. 
*/
router.get('/get-movies', checkToken, (req,res) => {
    if (Object.keys(req.body).length == 0) {
        var URL = 'https://api.themoviedb.org/3/discover/movie?api_key='+process.env.MOVIE_DB_API_KEY+'&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1';
    } else {
        var URL = 'https://api.themoviedb.org/3/search/movie?api_key='+process.env.MOVIE_DB_API_KEY+'&language=en-US&query='+encodeURI(req.body.keyword)+'&page=1&include_adult=false';
    }
    const getMovies = callMovieDb(URL, body => {  
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


/* Add movie to favourites
*  Given the data of a movie in json format, it adds said movie to the logged in user's
*  favourites list. It also adds a field (addedAt) with the date that the movie was added to the list. 
*/
router.post('/add-movie-to-favourites', checkToken, (req,res) => {
    fs.readFile('./favourites.txt', (err, data) => {
        if (err){
            console.log('Error reading file', err);
        } else {
            try {
                let favouritesData = JSON.parse(data);
                let userFavourites = findFavourites(favouritesData, req.user.email);
                if (userFavourites == null){
                    insertNewUserAndFavourites(favouritesData, req.user.email, req.body);
                    res.send('Successfully created favourites list and added movie');
                } else {
                    if (checkForMovie(userFavourites, req.body)) {
                        insertNewFavourite(favouritesData, req.user.email, req.body);
                        res.send('Successfully added movie to your favourites list!')
                    } else {
                        res.send('The movie you selected was already in your favourites');
                    }
                }
            } catch (err) {
                console.log('Error parsing data', err);
            }
        }
            
    });
});


/* Get my favourite movies
*  It returns the list of favourite movies for a given user (the user that is authenticated) 
*  ordered by a new field called suggestionForTodayScore with an arbitrary number between 0 and 99.
*/
router.get('/get-my-favourite-movies', checkToken, (req,res) => {
    fs.readFile('./favourites.txt', (err, data) => {
        if (err) {
            console.log('Error reading file', err);
        } else {
            try {
                let favouritesData = JSON.parse(data);
                let userFavourites = findFavourites(favouritesData, req.user.email);
                for (movie in userFavourites.favourites) {
                    userFavourites.favourites[movie].suggestionForTodayScore = getRandomArbitrary(0,99);
                }
                userFavourites.favourites.sort(function (a, b) {
                    if (a.suggestionForTodayScore <= b.suggestionForTodayScore){
                        return -1;
                    } else {
                        return 1;
                    } 
                })
                res.send(userFavourites);
            } catch (err) {
                console.log('Error parsing data', err);
            }
        }
    });
});

//Utils 

//Request to The Movie Db API
const callMovieDb = (URL, callback) => {
    request(URL, {json : true}, (err, res, body) => {
        if (err) 
            return callback(err);
        else
            return callback(body);
    });
};

//Returns an arbitrary random number between the min and max values
const getRandomArbitrary = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

//Looks for a user's favourite movie list
const findFavourites = (favouritesData, email) => {
    return favouritesData.find(entry => entry.email == email);
}

//The first time the user adds movies to favourites.txt
const insertNewUserAndFavourites = (favouritesData, email, movie) => {
    movie.addedAt = formattedDate();
    favouritesData[favouritesData.length] = { email: email, favourites: [movie]};
    fs.writeFile('./favourites.txt', JSON.stringify(favouritesData, null, 2), (err) => {
        if (err)
            console.log('Error writing file', err);
    });
}

//The user had previousley added favourite movies to favourites.txt
const insertNewFavourite = (favouritesData, email, movie) => {
    let userFavourites = findFavourites(favouritesData, email);
    movie.addedAt = formattedDate();
    userFavourites.favourites[userFavourites.favourites.length] = movie;
    fs.writeFile('./favourites.txt', JSON.stringify(favouritesData, null, 2), (err) => {
        if (err)
            console.log('Error writing file', err);
    })
}

//Checks if the movie the user is about to favourite isn't already in his/her list.
const checkForMovie = (userFavourites, movie) => {
    for (i in userFavourites.favourites){
        if (userFavourites.favourites[i].id == movie.id){
            return false;
        } 
    }
    return true;
}

//It returns today's date in YYYY-MM-DD format
const formattedDate = () =>{
    let datetime = new Date();
    let date = ("0" + datetime.getDate()).slice(-2);
    let month = ("0" + (datetime.getMonth() + 1)).slice(-2);
    let year = datetime.getFullYear();
    return year + "-" + month + "-" + date;
}


module.exports = router;