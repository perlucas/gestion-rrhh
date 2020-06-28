const mongoose = require('mongoose');
const Candidate = require('./Candidate');
const JobOffer = require('./JobOffer');

var JobRequestSchema = new mongoose.Schema({
   
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: Candidate.modelName,
        required: true
    },

    job: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: JobOffer.modelName,
        required: true
    },

    rejected: {
        type: Boolean,
        default: false
    },

    timestamp: Date,

    message: String
});

module.exports = mongoose.model('JobRequest', JobRequestSchema);

