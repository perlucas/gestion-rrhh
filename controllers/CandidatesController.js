const CandidatesServices = require('../services/CandidatesServices');
const JobRequest = require('../models/JobRequest');
const RequestResource = require('../resources/candidate/JobRequest');

var controller = {};

controller.admin = function (req, res) {
    res.render('candidates-admin', {
        title: 'Administrar Candidatos'
    });
};

controller.listAll = function (req, res) {
    CandidatesServices.findAllAsResources()
        .then(resources => res.json(resources))
        .catch(err => console.log(err));
};

controller.delete = function (req, res) {
    CandidatesServices.findOneAndDeleteById(req.params.id)
        .then(result => res.json({success: true}))
        .catch(err => res.status(500).json(err));
};

controller.listAllRequests = function (req, res) {
    res.render('requests-candidate.handlebars', {
        title: 'Mis Postulaciones'
    });
};

controller.fetchRequests = function (req, res) {
    CandidatesServices.fetchCandidateRequests()
        .then(result => {
            res.json(
                result.map(rr => RequestResource.fromJobRequest(rr))
            )
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
};

controller.deleteRequest = function (req, res) {
    CandidatesServices.deleteRequestFromCurrentUser(req.params.id)
        .then(deleted => {
            if (deleted) {
                res.json({success: true});
            }
            else {
                res.json({
                    success: false,
                    message: 'La solicitud no fue encontrada'
                });
            }
        })
        .catch(err => res.json({
            success: false,
            message: err.message
        }));
};

module.exports = controller;