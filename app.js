const { body, validationResult} = require('express-validator');
const cors = require("cors");
const express = require('express');
const bcrypt = require('bcrypt');
const formData = require("express-form-data");
const os = require("os");
const app = express();

const Profile = require('./schema/profile');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const options = {
    uploadDir: os.tmpdir(),
    autoClean: true
  };

app.use(formData.parse(options));
// delete from the request all empty files (size == 0)
app.use(formData.format());
// change the file objects to fs.ReadStream 
// app.use(formData.stream());
// union the body and the files
app.use(formData.union());


// parse application/json

app.post('/api/user', (req, res) => {

    if(!req.body._id)
        return res.status(400).json({error:true, msg:'Provide _id of user'});

    const { _id } = req.body;
    delete req.body._id;

    console.log(req.body)
    Profile.findByIdAndUpdate({ _id }, req.body, { new: true }).then(result => {
        console.log(result);
        return res.status(200).json({error:false, msg: 'User updated successfully', data:result});
    });

    // const user = new User(req.body);
    // user.save((err, result) => {
    //     if(err) {
    //         console.log(err);
    //         return res.status(400).json({error:true, msg:'Error adding user'})
    //     }
    //     console.log(result)
    //     res.status(200).json({error:false, msg: 'User added successfully'})
    // });
});

app.post('/api/user/signup', [
    body('email').isEmail().withMessage('Provide valid email'),
    body('password').isLength({ min: 5, max: 10 }).withMessage('Password must be min 5 characters')
  ], async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error:true, msg: errors.array()[0].msg });
    if(!req.body.email || !req.body.password)
        return res.status(400).json({ error:true, msg:'Provide email and password'});

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

app.post('/api/user/login', async (req, res) => {
    const { email, password } = req.body;
    if(!email || !password)
        return res.json({error:true, msg:'Provide email and password'});

    const user = await Profile.findOne({email});
    if(!user)
        return res.status(400).json({error:true, msg:'User does not exist'});
    
    const isValid = await bcrypt.compare(password, user.password); 
    if(!isValid)
        return res.status(400).json({error:true, msg:'Invalid password'});
    
    return res.status(200).json({error:false, msg:'Logged in successfully', data:user});
});

app.get("/", (req, res) => res.status(200).json({ status: true, result: 'server is running' }));
app.all("*", (req, res) => res.status(404).json({ error: true, message: 'invalid url' }));

module.exports = app;