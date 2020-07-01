const controller = require('../controllers/RecruitersController');

const Auth = require('../services/AuthServices');

const Configurator = require('./RouterConfigurator');

const configs = {
    routes: [
        {
            path: '/admin/recruiters',
            method: 'get',
            middleware: [
                Auth.middleware.userIsAdmin, 
                controller.admin
            ]
        },
        {
            path: '/explore-jobrequests',
            method: 'get',
            middleware: [
                Auth.middleware.userIsRecruiter, 
                controller.showRequests
            ]
        }
    ],
    all: [
        Auth.middleware.userIsLoggedIn
    ]
};

module.exports = Configurator.configureRouter(configs);