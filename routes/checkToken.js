const jwt = require('jsonwebtoken');

//This method checks for the authorization token for access permission 
const checkToken = (req, res, next) => {
    const token = req.headers['auth-token'];
    if (!token) 
        return res.status(401).send('Access denied');
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
}

module.exports = checkToken;