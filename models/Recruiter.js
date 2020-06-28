const mongoose = require('mongoose');
const moment = require('moment');
const JobOffer = require('./JobOffer');

var RecruiterSchema = new mongoose.Schema({
    name: {
        type: String,
        default: 'default'
    },

    birthdate: {
        type: Date,
        default: new Date(1995, 10, 08)
    },

    profileDescription: {
        type: String,
        default: ''
    }

});

RecruiterSchema.methods.getAge = function () {
    var now = moment();
    return now.diff(moment(this.birthdate), 'years');
};

RecruiterSchema.methods.findAnnouncedJobs = function () {
    return JobOffer.find({ announcer: this._id });
};

RecruiterSchema.methods.isAdmin = function () { return false; };

RecruiterSchema.methods.isRecruiter = function () { return true; };

RecruiterSchema.methods.isCandidate = function () { return false; };

module.exports = mongoose.model('Recruiter', RecruiterSchema);

