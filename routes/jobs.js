const express = require('express');
const JobsController = require('../controllers/JobsController');
const Auth = require('../services/AuthServices');

var router = express.Router();

router.use(Auth.middleware.userIsLoggedIn);

router.get('/jobs',
    Auth.middleware.userIsNotCandidate, 
    JobsController.listAll
);

router.get('/recruiter/jobs/edit/:id',
    Auth.middleware.userIsNotCandidate,
    JobsController.showEditForm
);

router.get('/explore-jobs',
    Auth.middleware.userIsCandidate,
    JobsController.showExplore
);

router.get('/jobs/request/:id',
    Auth.middleware.userIsCandidate,
    JobsController.showJobRequestForm
);

module.exports = router;