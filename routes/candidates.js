const controller = require('../controllers/CandidatesController');

const Auth = require('../services/AuthServices');

const Configurator = require('./RouterConfigurator');

const configs = {
    routes: [
        {
            path: '/admin/candidates',
            method: 'get',
            middleware: [
                Auth.middleware.userIsAdmin,
                controller.admin
            ]
        },
        {
            path: '/jobrequests',
            method: 'get',
            middleware: [
                Auth.middleware.userIsCandidate,
                controller.listAllRequests
            ]
        }
    ],
    all: [
        Auth.middleware.userIsLoggedIn
    ]
};

module.exports = Configurator.configureRouter(configs);