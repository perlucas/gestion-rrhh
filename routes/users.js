const UsersController = require('../controllers/UsersController');
const AccountsController = require('../controllers/AccountsController');

const Auth = require('../services/AuthServices');

const Configurator = require('./RouterConfigurator');

const configs = {
    routes: [
        {
            path: '/users/edit/:id',
            method: 'get',
            middleware: [
                Auth.middleware.userIsLoggedIn,
                UsersController.showUpdateForm
            ]
        },
        {
            path: '/register',
            method: 'get',
            middleware: [
                AccountsController.showRegisterForm
            ]
        },
        {
            path: '/register',
            method: 'post',
            middleware: [
                AccountsController.registerUser
            ]
        },
        {
            path: '/notifications/list',
            method: 'get',
            middleware: [
                Auth.middleware.userIsLoggedIn, 
                UsersController.showNotificationsList
            ]
        },
        {
            path: '/notifier',
            method: 'get',
            middleware: [
                Auth.middleware.userIsLoggedIn, 
                Auth.middleware.userIsAdmin, 
                UsersController.showNotifier
            ]
        }
    ],
    all: []
};

module.exports = Configurator.configureRouter(configs);