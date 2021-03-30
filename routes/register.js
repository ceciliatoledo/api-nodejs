const router = require('express').Router();
fs = require('fs');

//Register new user
router.post('/register', (req,res) => {
    const newUser = {
        email : req.body.email,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        password : req.body.password
    };
    fs.readFile('./users.txt', (err, data) => {
            if (err)
                throw err;
            let usersData = JSON.parse(data);   
            if (validUser(usersData, newUser.email)) {
                insertNewUser(newUser);
                res.send(`User ${newUser.email} successfuly registered`);
            } else {
                res.send('This email address is already taken by another user. Please enter a valid email address.'); 
            }
            
    });
    
    //console.log(user);
});

const validUser = (usersData, email) => {
    for (var i=0; i<usersData.length; i++) {
        if (usersData[i]['email'] == email) {
            return false;
        }
    }
    return true;
};

const insertNewUser = (newUser) => {
 
    fs.writeFile('./users.txt', newUser , (err) => {
        if (err)
            throw (err);
    });
}

// router.post('/login', (req,res) => {

// });

module.exports = router;