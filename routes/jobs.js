const JobsController = require('../controllers/JobsController');

const Auth = require('../services/AuthServices');

const configurator = require('./RouterConfigurator');

const routerConfig = {
    routes: [
        {
            path: '/jobs',
            method: 'get',
            middleware: [
                Auth.middleware.userIsNotCandidate,
                JobsController.listAll
            ]
        },
        {
            path: '/recruiter/jobs/edit/:id',
            method: 'get',
            middleware: [
                Auth.middleware.userIsNotCandidate,
                JobsController.showEditForm
            ]
        },
        {
            path: '/explore-jobs',
            method: 'get',
            middleware: [
                Auth.middleware.userIsCandidate,
                JobsController.showExplore
            ]
        },
        {
            path: '/jobs/request/:id',
            method: 'get',
            middleware: [
                Auth.middleware.userIsCandidate,
                JobsController.showJobRequestForm
            ]
        }
    ],

    all: [
        Auth.middleware.userIsLoggedIn
    ]
};

module.exports = configurator.configureRouter(routerConfig);