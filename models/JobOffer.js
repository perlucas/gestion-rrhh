const mongoose = require('mongoose');
const RecruiterModelName = 'Recruiter';
const LocationSchema = require('./Location');
const moment = require('moment');


var JobOfferSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Debe indicar un título para el trabajo']
    },
    description: {
        type: String,
        required: [true, 'Debe colocar una descripción para el trabajo']
    },
    expirationDate: {
        type: Date,
        required: [true, 'Debe indicar una fecha de expiración']
    },
    fulfilled: {
        type: Boolean,
        required: true,
        default: false
    },
    announcer: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: RecruiterModelName,
        required: true
    },
    location: {
        type: LocationSchema
    },
    isRemote: {
        type: Boolean,
        required: true,
        default: false
    },
    skills: [String]
});

JobOfferSchema.methods.hasExpired = function () {
    var now = moment();
    var expiresIn = moment(this.expirationDate);
    return now.diff(expiresIn) >= 0;
};

JobOfferSchema.methods.getExpirationDateAsHuman = function () {
    return moment(this.expirationDate).format('DD/MM/YYYY');
};

JobOfferSchema.methods.getSkillsAsString = function () {
    return this.skills.join(',');
};

JobOfferSchema.methods.getLocationAsString = function () {
    if (this.isRemote) return 'Remoto';
    return [
        this.location.country,
        this.location.state,
        this.location.city
    ]
        .filter(v => v.length > 0)
        .join(' - ');
};

module.exports = mongoose.model('JobOffer', JobOfferSchema);