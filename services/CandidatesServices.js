const UserCredentials = require('../models/UserCredentials');
const Candidate = require('../models/Candidate');
const CandidateResource = require('../resources/admin/Candidate');
const JobRequest = require('../models/JobRequest');
const Auth = require('../services/AuthServices');
const BaseNotification = require('../models/Notification').BaseNotification;

var services = {};

services.findAllAsResources = async function () {
    var result = await UserCredentials.find({ userType: Candidate.modelName })
        .populate('user');

    return result.map(rr => CandidateResource.fromCandidate(rr.user));
};

services.findOneAndDeleteById = async function (id) {

    // delete job requests
    var result = await JobRequest.deleteMany({ user: id });

    // delete user data
    result = await Candidate.deleteOne({ _id: id });

    // delete credentials
    var credentials = await UserCredentials.findOne({ user: id });

    await BaseNotification.deleteMany({ receiver: credentials._id });

    return UserCredentials.findByIdAndDelete(credentials._id);
};

services.fetchCandidateRequests = function () {
    return JobRequest.find({ user: Auth.services.getCurrentUser()._id })
        .populate('job');
};

services.deleteRequestFromCurrentUser = function (id) {
    return JobRequest.findOneAndDelete({ 
        _id: id, 
        user: Auth.services.getCurrentUser()._id 
    });
};

module.exports = services;