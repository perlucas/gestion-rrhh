
const JobServices = require('../services/JobOffersServices');
const JobOffer = require('../models/JobOffer');
const JobRequest = require('../models/JobRequest');
const Auth = require('../services/AuthServices');

var JobsController = {};

JobsController.listAll = function (req, res) {
    res.render('list-jobs', {
        title: 'Trabajos anunciados'
    });
};

JobsController.createNew = function (req, res) {
    JobServices.createJobFromRequest(req)
        .then(newJob => res.json({success: true}))
        .catch(err => res.status(500).json({ errors: err.errors }));
};

JobsController.fetchAll = async function (req, res) {
    const page = req.query.page || 1;

    var jobs = JobServices.fetchFromCurrentUser(page);
    var count = JobServices.countFromCurrentUser();
    Promise.all([jobs, count])
        .then(resultArr => {
            res.json({
                jobs: resultArr[0],
                pages: Math.ceil(resultArr[1] / JobServices.pageAmount),
                currentPage: parseInt(page)
            });
        })
        .catch(err => res.status(500).json(err));
};

JobsController.showEditForm = function (req, res) {

    JobServices.findByIdAndCheckRecruiter(req.params.id)
        .then(job => {
            jobData = job.toJSON();
            jobData.skills = job.getSkillsAsString();
            jobData.expirationDate = job.getExpirationDateAsHuman();

            res.render('edit-job', {
                title: 'Detalles del trabajo',
                job: jobData
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).end('Error on job id or credentials');
        });
};

JobsController.updateJob = function (req, res) {
    JobServices.updateJobFromRequest(req)
        .then(job => res.json({success: true}))
        .catch(err => res.status(500).json(err));
};

JobsController.deleteJob = function (req, res) {
    JobServices.deleteJobById(req.params.id)
        .then(() => res.json({success: true}))
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
};

JobsController.showExplore = function (req, res) {
    res.render('explore-jobs', {
        title: 'Explorar Ofertas'
    });
};

JobsController.queryAvailable = function (req, res) {

    var filters = {};

    const checkIncludes = cond => cond && cond === '+'
    const checkExcludes = cond => cond && cond === '-';
    const getIncludePattern = patt => new RegExp(patt, 'i');
    const getExcludePattern = patt => new RegExp(`^((?!${patt}).)*$`, 'i');

    // check for title & description
    ['title', 'description'].forEach(name => {
        let expression = req.body ? req.body[name] : undefined;
        if (expression && expression[name]) {
            if (checkIncludes(expression.condition)) {
                filters[name] = getIncludePattern(expression[name]);
            }
            else if (checkExcludes(expression.condition)) {
                filters[name] = getExcludePattern(expression[name]);
            }
        }
    });

    // check for location
    var expression = req.body ? req.body.location : undefined;
    if (expression) {
        if (expression.isRemote) {
            filters.isRemote = true;
        }
        else {
            ['country', 'state', 'city'].forEach(place => {
                if (expression[place]) {
                    filters[`location.${place}`] = getIncludePattern(expression[place]);
                }
            });
        }
    }

    // check for skills
    expression = req.body ? req.body.skills : undefined;
    if (expression && expression.skills.length) {
        if (checkIncludes(expression.condition)) {
            var elements = [];
            expression.skills.forEach(sk => {
                elements.push({
                    $elemMatch: { $regex: sk, $options: 'i' }
                });
            });

            filters.skills = {
                $all: elements
            };
        } else if (checkExcludes(expression.condition)) {
            var elements = [];
            expression.skills.forEach(sk => {
                elements.push(new RegExp(sk, 'i'));
            });

            filters.skills = {
                $not: { $in: elements }
            };
        }
    }

    JobServices.fetchForCandidate(filters)
        .then(result => res.json(result))
        .catch(err => {
            console.log(err);
            res.status(500).json({
                message: 'No se pudo realizar la búsqueda'
            });
        });
};

JobsController.showJobRequestForm = function (req, res) {
    JobOffer.findById(req.params.id)
        .populate('announcer', 'name')
        .then(job => {

            JobRequest.countDocuments({
                user: Auth.services.getCurrentUser()._id,
                job: job._id
            })
                .then(cant => {
                    res.render('request-job', {
                        title: 'Detalles del trabajo',
                        job: job.toObject(),
                        location: job.getLocationAsString(),
                        finishDate: job.getExpirationDateAsHuman(),
                        expired: job.hasExpired(),
                        requested: cant > 0
                    });
                })
                .catch(err => {
                    throw err
                });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json(err);
        });
};

JobsController.makeJobRequest = function (req, res) {
    JobServices.requestJobWithCurrentUser(req.params.id, req.body.message)
        .then(() => res.json({success: true}))
        .catch(err => console.log(err));
};

module.exports = JobsController;