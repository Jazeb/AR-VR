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
    }
}, { collection: 'profile' }, { __v: false });

module.exports = mongoose.model('profile', Profile);