const bodyParser = require('body-parser');
const express = require('express');
const bcrypt = require('bcrypt')
const app = express();

const User = require('./schema/user');
const Profile = require('./schema/profile');


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
        res.status(200).json({error:false, msg: 'User added successfully'})
    });
});

app.post('/user/signup', async(req, res) => {

    const user = await Profile.findOne({email:req.body.email});
    if(user) return res.status(400).json({error:true, msg: 'User already exists with this email'});

    if(req.body.password !== req.body.confirm_password)
        return res.status(400).json({error:true, msg:'Password must match'});
        
    const salt = bcrypt.genSaltSync(10);

    req.body.password = bcrypt.hashSync(req.body.password, salt);

    const profile = new Profile(req.body);
    profile.save((err, result) => {
        if(err) {
            console.log(err);
            return res.status(400).json({error:true, msg:'Error user signup'})
        }
        console.log(result)
        res.status(200).json({error:false, msg: 'User created successfully', user:result})
    });
});

// app.post('/user/social/signup', async(req, res) => {

//     if(!req.body.token)
//         return res.status(400).json({error:true, msg:'Provide token as user is from social login'});

//     if(!['FACEBOOK', 'GOOGLE', 'APPLE'].includes(req.body.social_login_type))
//         return res.status(400).json({error:true, msg:'Invalid value for social type'});
    
//     const user = await Profile.findOne({email:req.body.email, is_social_login:true});
//     if(user)
//         return res.status(200).json({error:false, msg:user});

//     req.body.is_social_login = true;
//     const profile = new Profile(req.body);
//     profile.save((err, result) => {
//         if(err) {
//             console.log(err);
//             return res.status(400).json({error:true, msg:'Error user signup'})
//         }
//         console.log(result)
//         res.status(200).json({error:false, msg: 'User created successfully', user:result})
//     });
// });

app.post('/user/login', async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password)
        return res.json({error:true, msg:'Provide email and password'});

    const user = await Profile.findOne({email});
    if(!user)
        return res.status(400).json({error:true, msg:'User does not exist'});
    
    const isValid = bcrypt.compare(password, user.password);
    if(!isValid)
        return res.status(400).json({error:true, msg:'Invalid password'});
    
    return res.status(200).json({error:false, msg:user})
})

app.get("/", (req, res) => res.status(200).json({ status: true, result: 'server is running' }));
app.all("*", (req, res) => res.status(404).json({ error: true, message: 'invalid url' }));

module.exports = app;