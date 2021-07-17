const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const User = Schema({
    name: {
        type: String,
        required: false,
    },
    gender: {
        type: String,
        required: 0
    },
    age: {
        type: Number,
        required: false
    },
    favourite_food: {
        type: String,
        required: false
    }
}, { collection: 'users' }, { __v: false });

module.exports = mongoose.model('users', User);