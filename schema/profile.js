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
    }
}, { collection: 'profile' }, { __v: false });

module.exports = mongoose.model('profile', Profile);