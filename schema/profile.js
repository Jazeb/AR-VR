const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const Profile = Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    otp:{
        type: Number,
        required:false
    },
    isOtpVerified: {
        type: Boolean,
        required: false
    },
    verified:{
        type: Boolean,
        required: false
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    address: {
        type: String,
        required: false
    },
    phone_no: {
        type: String,
        required: false
    },
    dob: {
        type: String,
        required: false
    },
    age: {
        type: Number,
        required: false
    },
    favourite_food: {
        type: String,
        required: false
    },
    spell_game_stats: {
        level:{
            type: Number,
            required: true
        },
        troffy:{
            type: Number,
            required: true
        }
    },
    puzzle_game_stats: {
        level:{
            type: Number,
            required: true
        },
        troffy:{
            type: Number,
            required: true
        }
    }
}, { collection: 'profile' }, { __v: false });

module.exports = mongoose.model('profile', Profile);