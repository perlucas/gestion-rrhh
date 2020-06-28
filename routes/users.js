const express = require('express');
const UsersController = require('../controllers/UsersController');
const AccountsController = require('../controllers/AccountsController');
const Auth = require('../services/AuthServices');

var router = express.Router();

router.get('/users/edit/:id', Auth.middleware.userIsLoggedIn, UsersController.showUpdateForm);

router.get('/register', AccountsController.showRegisterForm);

router.post('/register', AccountsController.registerUser);

router.get('/notifications/list', Auth.middleware.userIsLoggedIn, UsersController.showNotificationsList);

router.get('/notifier', Auth.middleware.userIsLoggedIn, Auth.middleware.userIsAdmin, UsersController.showNotifier);

module.exports = router;