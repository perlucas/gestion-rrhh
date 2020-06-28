const AuthServices = require("../services/AuthServices");
const JobOffer = require("../models/JobOffer");
const UserCredentials = require('../models/UserCredentials');
const JobRequest = require('../models/JobRequest');
const BaseNotification = require('../models/Notification').BaseNotification;

const moment = require('moment');

var controller = {};

const getAdminValues = async function () {
    var data = {
        first: 0, // offers in active search
        second: 0, //registered users (not admin)
        third: 0 // jobrequests (not rejected)
    };
    
    var promises = [
        JobOffer.countDocuments({ 
            fulfilled: false, 
            expirationDate: { $gt: moment().toDate() } 
        }),

        UserCredentials.countDocuments({
            userType: { $ne: 'Admin' }
        }),

        JobRequest.countDocuments({
            rejected: false
        })
    ];

    [
        data.first,
        data.second,
        data.third
    ] = await Promise.all(promises);

    return data;
};


const getRecruiterValues = async function () {
    var data = {
        first: 0, // active offers published by user
        second: 0, // requests to check (! rejected)
        third: 0 // unread notifications
    };

    const countPendingRequests = async function () {

        var jobs = await JobOffer.find({
            announcer: AuthServices.services.getCurrentUser()._id,
            fulfilled: false,
            expirationDate: { $gt: moment().toDate() }
        });

        return JobRequest.count({
            job: { $in: jobs.map(jj => jj._id) },
            rejected: false
        });
    };

    var promises = [
        JobOffer.count({
            announcer: AuthServices.services.getCurrentUser()._id,
            fulfilled: false,
            expirationDate: { $gt: moment().toDate() }
        }),

        countPendingRequests(),

        BaseNotification.count({
            receiver: AuthServices.services.userCredentials._id,
            isRead: false
        })
    ];

    [
        data.first,
        data.second,
        data.third
    ] = await Promise.all(promises);

    return data;
};

const getCandidateValues = async function () {
    var data = {
        first: 0, //new offers
        second: 0, // sent requests
        third: 0 // unread notifications
    };

    const countNoRequestedOffers = function () {
        var myRequests = JobRequest.find({
            user: AuthServices.services.getCurrentUser()._id
        });

        var filters = {
            fulfilled: false,
            expirationDate: { $gt: moment().toDate() }
        };

        if (myRequests.length > 0) {
            filters._id = { $nin: myRequests.map(rr => rr.job) };
        }

        return JobOffer.count(filters);
    };

    var promises = [
        countNoRequestedOffers(),

        JobRequest.count({
            user: AuthServices.services.getCurrentUser()._id,
            rejected: false
        }),

        BaseNotification.count({
            receiver: AuthServices.services.userCredentials._id,
            isRead: false
        })
    ];

    [
        data.first,
        data.second,
        data.third
    ] = await Promise.all(promises);

    return data;
};

controller.getStatistics = async function (req, res) {

    if (AuthServices.services.userCredentials.isAdmin()) {
        return getAdminValues()
            .then(response => res.json(response))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
        }
    else if (AuthServices.services.userCredentials.isRecruiter()) {
        return getRecruiterValues()
            .then(response => res.json(response))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
        }
    else {
        return getCandidateValues()
            .then(response => res.json(response))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    }
};

module.exports = controller;