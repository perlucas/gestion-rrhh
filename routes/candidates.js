const express = require('express');
const controller = require('../controllers/CandidatesController');
const Auth = require('../services/AuthServices');

var router = express.Router();

router.get('/admin/candidates', Auth.middleware.userIsLoggedIn, Auth.middleware.userIsAdmin, controller.admin);

router.get('/jobrequests', Auth.middleware.userIsLoggedIn, Auth.middleware.userIsCandidate, controller.listAllRequests);

module.exports = router;