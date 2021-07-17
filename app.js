const bodyParser = require('body-parser');
const express = require('express');
const app = express();

const User = require('./schema/user');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/user', (req, res) => {
    const user = new User(req.body);
    user.save((err, result) => {
        if(err){
            console.log(err);
            return res.status(400).json({error:true, msg:'Error adding user'})
        }
        console.log(result)
        req.status(200).json({error:false, msg: 'User added successfully'})
    });
});

app.get("/", (req, res) => res.status(200).json({ status: true, result: 'server is running' }));
app.all("*", (req, res) => res.status(404).json({ error: true, message: 'invalid url' }));

module.exports = app;