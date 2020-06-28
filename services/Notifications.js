const UserCredentials = require("../models/UserCredentials");
const notificationModels = require('../models/Notification');
const JobRequest = require('../models/JobRequest');
const JobOffer = require("../models/JobOffer");

module.exports.notifyNewUser = async function (newUserCredentialsId, isRecruiter = false) {
    var credentials = await UserCredentials.findById(newUserCredentialsId);
    var notifications = [];
    
    // create new user notifications
    var admins = await UserCredentials.find({ userType: 'Admin' });

    utype = isRecruiter ? 'Recruiter' : 'Candidate';

    admins.forEach(admin => {
        notifications.push(notificationModels.NewUserNotification.create({
            receiver: admin._id,
            user: credentials.user,
            userType: utype
        }));
    });

    // create welcome notification
    notifications.push(notificationModels.WelcomeNotification.create({
        receiver: credentials._id
    }));

    return Promise.all(notifications);
};


module.exports.notifyJobAvailability = async function (jobId, isFulfilled) {
    var requests = await JobRequest.find({
        job: jobId
    });

    var userIds = requests.map(rr => rr.user);

    if (userIds.length) {

        var credentials = await UserCredentials.find({
            user: { $in: userIds },
            userType: 'Candidate'
        });

        if (credentials.length) {
            var results = credentials.map(cred => notificationModels.JobStateChangedNotification.create({
                receiver: cred._id,
                job: jobId,
                fulfilled: isFulfilled
            }));
            await Promise.all(results);
        }
    }
};


module.exports.notifyJobDeletion = async function (jobId) {

    // get requests
    var requests = await JobRequest.find({ job: jobId });

    if (requests.length > 0) {

        // get user credentials
        var promises = requests.map(rr => UserCredentials.findOne({ user: rr.user }));

        // get job data
        promises.unshift(JobOffer.findById(jobId));

        let jobData, credentials;

        [jobData, ...credentials] = await Promise.all(promises);

        return Promise.all(
            credentials.map(creds => notificationModels.JobDeletedNotification.create({
                receiver: creds._id,
                jobTitle: jobData.title
            }))
        );
    }
};