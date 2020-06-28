const RecruitersServices = require('../services/RecruitersServices');
const JobRequest = require('../models/JobRequest');
const AuthServices = require('../services/AuthServices');
const UserCredentials = require('../models/UserCredentials');
const RequestRejectedNotification = require('../models/Notification').RequestRejectedNotification;

var RecruitersController = {

    admin: function (req, res) {
        res.render('recruiters-admin', {
            title: 'Administrar Reclutadores'
        });
    },

    listAll : function (req, res) {
        RecruitersServices.findAllAsResources()
            .then(resources => res.json(resources))
            .catch(err => console.log(err));
    },

    createNew: async function (req, res) {
        RecruitersServices.createFromQuickRequest(req)
            .then(credentials => res.json({success: true}))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    },

    delete: function (req, res) {
        RecruitersServices.findOneAndDeleteByUsername(req.params.username)
            .then(deleted => res.json({success: true}))
            .catch(err => console.log(err));
    },

    showRequests: function (req, res) {
        res.render('explore-requests', {
           title: 'Ver Postulaciones' 
        });
    },

    listReceived: function (req, res) {
        RecruitersServices.findReceivedRequests()
            .then(requests => {
                res.json(requests);
            })
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    },

    rejectJobRequest: async function (req, res) {
        console.log("Message of rejection: " + req.body.message);

        var request = await JobRequest.findById(req.params.id);

        request.rejected = true;

        await request.save();

        var candidateCreds = await UserCredentials.findOne({ user: request.user, userType: 'Candidate' });

        RequestRejectedNotification.create({
            receiver: candidateCreds._id,
            request: request._id,
            message: req.body.message
        })
            .then(nn => res.json({ success: true }))
            .catch(err => {
                console.log(err);
                res.status(500).json(err);
            });
    }
};

module.exports = RecruitersController;