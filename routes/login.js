const controller = require('../controllers/LoginController');

const Configurator = require('./RouterConfigurator');

const configs = {
    routes: [
        {
            path: '/login',
            method: 'get',
            middleware: [controller.show]
        },
        {
            path: '/login',
            method: 'post',
            middleware: [controller.doLogin]
        },
        {
            path: '/logout',
            method: 'get',
            middleware: [controller.doLogout]
        }
    ],
    all: []
};

module.exports = Configurator.configureRouter(configs);