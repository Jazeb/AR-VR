const { body, validationResult} = require('express-validator');
const cors = require("cors");
const express = require('express');
const bcrypt = require('bcrypt');
const formData = require("express-form-data");
const os = require("os");
const app = express();

const Profile = require('./schema/profile');

const mailer = require('./mailer');

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


app.post('/api/user/updatestats', (req, res) => {
    const { level, troffy, gameName, _id } = req.body; //spellgame, puzzlegame
    if(!level || !troffy || !gameName || !_id)
        return res.status(400).json({error: true, msg: 'Provide required fields'});
    
    if(!['spellGame', 'puzzleGame'].includes(gameName))
        return res.status(400).json({ error:true, msg: 'Invalid game name provided' });

    let set = null;;
    let inc = { 'spell_game_stats.troffy': +troffy };

    if(gameName == 'spellGame') {
        set = { 'spell_game_stats.level': level };
        inc = { 'spell_game_stats.troffy': +troffy };
    } 
    else {
        set = { 'puzzle_game_stats.level': level };
        inc = { 'puzzle_game_stats.troffy': +troffy };
    }
    Profile.findByIdAndUpdate(
        { _id }, 
        { $set: set, $inc: inc}, 
        { new: true })
        .then(result => {
        console.log(result);
        return res.status(200).json({error:false, msg: 'Key60', data:result});
    });
});

app.post('/api/user', (req, res) => {

    if(!req.body._id)
        return res.status(400).json({error:true, msg:'Provide _id of user'});

    const { _id } = req.body;
    delete req.body._id;

    console.log(req.body)
    Profile.findByIdAndUpdate({ _id }, req.body, { new: true }).then(result => {
        console.log(result);
        return res.status(200).json({error:false, msg: 'Key60', data:result});
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

// app.put('/api/sendEmailOtp', async (req, res) => {
//     const { email } = req.body;
//     if(!email) return res.status(400).json({ error:true, msg: 'Provide email' });

//     const user = await Profile.findOne({ email });
//     if(!user) return res.status(400).json({error:true, msg: 'Email does not exist'});

//     let otp = Math.floor(1000 + Math.random() * 9000);
//     let data = { otp, email };
    
//     await Promise.all([
//         mailer.sendOTPToEmail(data),
//         Profile.updateOne({ _id:user._id }, { $set:{ otp, verified:0 }}),
//     ]);

//     return res.status(200).json({ error:false, msg:'OTP sent to your registered email' });

// });

app.get('/api/verifyEmail', (req, res) => {
    try {
        let { otp, email } = req.query;
        if(!otp || !email) return res.status(400).json({ error:true, msg:'Provide OTP and email '});
    
        const user = await Profile.findOne({ email });
        if(!user) return res.status(400).json({ error:true, msg: 'Email does not exist' });

        if(user.isOtpVerified) return res.status(400).json({ error:true, msg:'OTP already verified for this user' });
    
        if(user.otp !== +otp) return res.status(400).json({ error:true, msg:'Invalid OTP' });
        
        res.status(200).json({ error:false, msg:'OTP verified successfully' });
        await Profile.updateOne({ _id:user._id }, { $set:{ verified:true }});
        return;
        
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error:true, msg:error.message });
    }
});

app.post('/api/user/signup', [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 4, max: 10 }).withMessage('Password must contain min. 4 characters and max. 10 characters')
  ], async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error:true, msg: errors.array()[0].msg });
    if(!req.body.email || !req.body.password)
        return res.status(400).json({ error:true, msg:'Provide email and password'});

    const user = await Profile.findOne({ email:req.body.email });
    if(user) return res.status(400).json({ error:true, msg: 'Email already exists!' });

    if(req.body.password !== req.body.confirm_password)
        return res.status(400).json({ error:true, msg:'Password must match' });
        
    const salt = bcrypt.genSaltSync(10);

    req.body.password = bcrypt.hashSync(req.body.password, salt);
    req.body.isOtpVerified = false;
    
    const spell_game_stats = {
        level: 0,
        troffy: 0
    }

    const puzzle_game_stats = {
        level: 0,
        troffy: 0
    }

    req.body.spell_game_stats = spell_game_stats;
    req.body.puzzle_game_stats = puzzle_game_stats;
    
    const profile = new Profile(req.body);
    profile.save((err, result) => {
        if(err) {
            console.error(err);
            return res.status(400).json({error:true, msg:'Error user signup'})
        }
        console.log(result)
        let otp = Math.floor(1000 + Math.random() * 9000);
        let data = { otp, email };
        
        await Promise.all([
            mailer.sendOTPToEmail(data),
            Profile.updateOne({ _id:user._id }, { $set:{ otp, verified:0 }}),
        ]);

        return res.status(200).json({ error:false, msg:'OTP sent to your registered email' });
        // res.status(200).json({ error:false, msg: 'User created successfully', user:result });
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
        return res.json({ error:true, msg:'Provide email and password'});

    const user = await Profile.findOne({email});
    if(!user)
        return res.status(400).json({ error:true, msg:'Key61' });
    
    const isValid = await bcrypt.compare(password, user.password); 
    if(!isValid)
        return res.status(400).json({ error:true, msg:'Key62'});
    
    return res.status(200).json({ error:false, msg:'Logged in successfully', data:user});
});

app.get("/", (req, res) => res.status(200).json({ status: true, result: 'server is running' }));
app.all("*", (req, res) => res.status(404).json({ error: true, message: 'invalid url' }));

module.exports = app;