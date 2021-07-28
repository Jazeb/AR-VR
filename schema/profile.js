const mongoose = require('mongoose').set('debug', true);
const Schema = mongoose.Schema;

const Profile = Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    is_social_login: {
        type: Boolean,
        required: false,
        default: false
    },
    social_login_type:{
        type: String,
        required:false
    },
    token: {
        type: String,
        required: false
    }
}, { collection: 'profile' }, { __v: false });

module.exports = mongoose.model('profile', Profile);