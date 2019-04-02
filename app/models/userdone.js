var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

var UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    _id: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firsttime: {
        type: String,
        required: true
    },
    childpic: {
        type: String,
        required: true
    }
});
module.exports = mongoose.model('userdone', UserSchema);
