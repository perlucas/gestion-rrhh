const mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({
    country: String,
    state: String,
    city: String
});

module.exports = LocationSchema;