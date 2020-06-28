const UserCredentials = require('../models/UserCredentials');
const Recruiter = require('../models/Recruiter');
const RecruiterResource = require('../resources/admin/Recruiter');
const JobsServices = require('../services/JobOffersServices');
const JobOffer = require('../models/JobOffer');
const AuthServices = require('./AuthServices');
const moment = require('moment');
const JobRequest = require('../models/JobRequest');
const NotificationsServices = require('../services/Notifications');
const notificationModels = require('../models/Notification');

var RecruiterServices = {};

RecruiterServices.findAllAsResources = async function () {
    var credentials = await UserCredentials.find({ userType: Recruiter.modelName })
        .populate('user');
    return Promise.all(credentials.map((d, i) => RecruiterResource.fromRecruiterCredentials(d)));
};

RecruiterServices.createFromQuickRequest = async function (request) {
    try {
        var user = await Recruiter.create({});
        var credentials = await UserCredentials.create({
            username: request.body.username,
            email: request.body.email,
            password: request.body.password,
            user: user._id,
            userType: user.constructor.modelName
        });

        await NotificationsServices.notifyNewUser(credentials._id, true);

        return credentials;
    }
    catch (err) {
        await Recruiter.deleteOne({ _id: user._id })
        throw err;
    }
};

RecruiterServices.findOneAndDeleteByUsername = async function (username) {
    var deleted = await UserCredentials.findOneAndDelete({
        username: username
    });

    var notifs = await notificationModels.BaseNotification.deleteMany({
        receiver: deleted._id
    });

    var jobs = await JobsServices.deleteJobsByRecruiterId(deleted.user);

    return Recruiter.findOneAndDelete({
        _id: deleted.user
    });
};

RecruiterServices.findReceivedRequests = async function () {
    var announcedJobs = await JobOffer.find({
        announcer: AuthServices.services.getCurrentUser()._id,
        fulfilled: false,
        expirationDate: { $gt: moment().toDate() }
    });

    var ids = announcedJobs.map(jj => jj._id);

    var requests = await JobRequest.find({
        rejected: false,
        job: { $in: ids }
    })
        .populate('user')
        .populate('job');

    const makeJson = async function (req) {

        var credentials = await UserCredentials.findOne({
            user: req.user._id
        });

        return {
            id: req._id,
            message: req.message,
            date: moment(req.timestamp).format('DD/MM/YYYY'),
            job: {
                id: req.job._id,
                title: req.job.title
            },
            candidate: {
                name: req.user.name,
                age: req.user.getAge(),
                email: credentials.email,
                location: req.user.getLocationAsString(),
                skills: req.user.skills,
                cvfile: req.user.cvfilename
            }
        };
    };

    return Promise.all(
        requests.map(rr => makeJson(rr))
    );
};

module.exports = RecruiterServices;