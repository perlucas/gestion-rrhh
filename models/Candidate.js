const mongoose = require('mongoose');
const LocationSchema = require('./Location');
const moment = require('moment');

var CandidateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Debe ingresarse un nombre'],
        match: [
            /^[a-zA-ZÀ-ÿ\u00f1\u00d1]+(\s*[a-zA-ZÀ-ÿ\u00f1\u00d1]*)*[a-zA-ZÀ-ÿ\u00f1\u00d1]+$/,
            'Debe ingresarse un nombre válido'
        ]
    },

    birthdate: {
        type: Date,
        required: [true, 'Debe ingresarse una fecha de nacimiento']
    },

    profileDescription: {
        type: String,
        default: ''
    },

    location: {
        type: LocationSchema
    },

    skills: [String],

    cvfilename: {
        type: String,
        default: ''
    }

});

CandidateSchema.methods.getAge = function () {
    var now = moment();
    return now.diff(moment(this.birthdate), 'years');
};

CandidateSchema.methods.isAdmin = function () { return false; };

CandidateSchema.methods.isRecruiter = function () { return false; };

CandidateSchema.methods.isCandidate = function () { return true; };

CandidateSchema.methods.getLocationAsString = function () {
    return [
        this.location.country,
        this.location.state,
        this.location.city
    ]
        .filter(val => val.length > 0)
        .join(' - ');
};

module.exports = mongoose.model('Candidate', CandidateSchema);

