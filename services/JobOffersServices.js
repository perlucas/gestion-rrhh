const JobOffer = require('../models/JobOffer');
const JobRequest = require('../models/JobRequest');
const UserCredentials = require('../models/UserCredentials');
const Auth = require('./AuthServices');
const JobResource = require('../resources/recruiter/JobOffer');
const moment = require('moment');
const NotificationServices = require('./Notifications');

var JobOfferServices = {

    pageAmount: 5

};


JobOfferServices.createJobFromRequest = function (req) {
    return JobOffer.create({
        title: req.body.title,
        description: req.body.description,
        expirationDate: moment(req.body.expirationDate, 'DD/MM/YYYY').toDate(),
        location : {
            country: req.body.location.country,
            state: req.body.location.state,
            city: req.body.location.city,
        },
        isRemote: req.body.isRemote,
        announcer: Auth.services.getCurrentUser()._id,
        skills: req.body.skills
    });
};


JobOfferServices.fetchFromCurrentUser = async function (page) {
    const pageAmount = this.pageAmount;
    var criteria = {};
    if (Auth.services.getCurrentUser().isRecruiter()) {
        criteria.announcer = Auth.services.getCurrentUser()._id;
    }

    var jobs = await JobOffer.find(criteria)
        .skip( (page - 1) * pageAmount)
        .limit(pageAmount);
        
    return jobs.map(job => JobResource.fromJobOffer(job));
};

JobOfferServices.countFromCurrentUser = async function () {
    var criteria = {};
    if (Auth.services.getCurrentUser().isRecruiter()) {
        criteria.announcer = Auth.services.getCurrentUser()._id;
    }
    var count = await JobOffer.countDocuments(criteria);
    return count;
};

JobOfferServices.findByIdAndCheckRecruiter = function(id) {
    var criteria = { _id: id };
    if (Auth.services.getCurrentUser().isRecruiter()) {
        criteria.announcer = Auth.services.getCurrentUser()._id;
    }
    return JobOffer.findOne(criteria);
};

JobOfferServices.updateJobFromRequest = async function (req) {
    var criteria = { _id: req.params.id };
    if (Auth.services.getCurrentUser().isRecruiter()) {
        criteria.announcer = Auth.services.getCurrentUser()._id;
    }

    var olderDocument = await JobOffer.findOne(criteria, 'fulfilled');

    return JobOffer.
        
    findOneAndUpdate(criteria, {
        title: req.body.title,
        description: req.body.description,
        skills: req.body.skills,
        isRemote: req.body.isRemote,
        expirationDate: moment(req.body.expirationDate, 'DD/MM/YYYY').toDate(),
        fulfilled: req.body.fullfilled,
        location: req.body.location
    }, { runValidators: true }).
    
    then(() => {
        if (olderDocument.fulfilled !== req.body.fullfilled) {
            // notify to interested users about the new job state
            NotificationServices.notifyJobAvailability(olderDocument._id, req.body.fullfilled);
        }
    });

};

JobOfferServices.deleteJobById = async function (id) {

    // notify job deletion
    await NotificationServices.notifyJobDeletion(id);

    // delete job requests firstly
    var deleted = await JobRequest.deleteMany({ job: id });

    // delete job
    return JobOffer.findByIdAndDelete(id);
};

JobOfferServices.deleteJobsByRecruiterId = async function (id) {
    // delete job requests firstly
    var jobs = await JobOffer.find({ announcer: id });
    var deletes = jobs.map(job => JobOfferServices.deleteJobById(job._id));
    return Promise.all(deletes);
};

JobOfferServices.fetchForCandidate = async function (filters) {
    filters.fulfilled = false;
    filters.expirationDate = { $gt: moment().toDate() };
    
    var result = await JobRequest.find({ user: Auth.services.getCurrentUser()._id })
        .distinct('job');

    if (result.length) {
        filters._id = {$nin: result};
    }

    return JobOffer.find(filters)
        .select('title location skills isRemote');
};


JobOfferServices.requestJobWithCurrentUser = async function(jobId, message) {
    if ( ! Auth.services.getCurrentUser().isCandidate()) {
        throw "Current user ust be a Candidate";
    }

    var myRequests = await JobRequest.find({
        job: jobId,
        user: Auth.services.getCurrentUser()._id
    });

    if (myRequests.length > 0) {
        throw "User can't request the same job twice";
    }

    return JobRequest.create({
        job: jobId,
        user: Auth.services.getCurrentUser()._id,
        timestamp: moment().toDate(),
        message: message
    });
};

module.exports = JobOfferServices;