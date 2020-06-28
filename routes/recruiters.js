const express = require('express');
const controller = require('../controllers/RecruitersController');
const Auth = require('../services/AuthServices');

var router = express.Router();

router.get('/admin/recruiters', Auth.middleware.userIsLoggedIn, Auth.middleware.userIsAdmin, controller.admin);

router.get('/explore-jobrequests', Auth.middleware.userIsLoggedIn, Auth.middleware.userIsRecruiter, controller.showRequests);

module.exports = router;