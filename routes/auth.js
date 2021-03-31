const router = require('express').Router();
const bcrypt = require('bcrypt');
fs = require('fs');

//Register new user
router.post('/register', (req,res) => {
    fs.readFile('./users.txt', async (err, data) => {
            if (err) {
                console.log('Error reading file', err);
            } else {
                try {
                    let usersData = JSON.parse(data);
                    if (findUser(usersData, req.body.email) == null) {
                        const hashedPassword = await bcrypt.hash(req.body.password, 10);
                        const newUser = {
                            email: req.body.email,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            password: hashedPassword
                        };
                        insertNewUser(usersData, newUser);
                        res.status(201).send(`User ${newUser.email} successfuly registered`);
                    } else {
                        res.send('This email address is already taken by another user. Please enter a valid email address.');
                    }
                } catch (err) {
                    res.status(500).send(err);
                }
            }
        });
});

router.post('/login', (req,res) => {
    fs.readFile('./users.txt', async (err, data) => {
        if (err) {
            console.log('Error reading file', err);
        } else {
            try {
                let usersData = JSON.parse(data);
                let user = findUser(usersData, req.body.email);
                if (user == null){
                    res.status(400).send('User not found');
                } else {
                    try{
                        if (await bcrypt.compare(req.body.password, user.password)) {
                            res.send('Successful login');
                        } else {
                            res.send('Not allowed');
                        }
                    } catch {
                        res.status(500).send('Error bycrypt compare');
                    }
                }
            } catch (err) {
                res.status(500).send(err);
            }
        }
    });
});


//Utils
const findUser = (usersData, email) => {
    return usersData.find(user => user.email == email);
};

const insertNewUser = (usersData, newUser) => {
    usersData[usersData.length] = newUser;
    fs.writeFile('./users.txt', JSON.stringify(usersData, null, 2), (err) => {
        if (err)
            console.log('Error writing file', err);
    });
};

module.exports = router;