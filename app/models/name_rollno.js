var mongoose = require('mongoose');
var Schema = mongoose.Schema; 
var srpSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});
module.exports = mongoose.model('name_rollno', srpSchema);