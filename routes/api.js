const express = require('express');
const path = require('path');
const Auth = require('../services/AuthServices');
const RecruitersController = require('../controllers/RecruitersController');
const CandidatesController = require('../controllers/CandidatesController');
const UsersController = require('../controllers/UsersController');
const JobsController = require('../controllers/JobsController');
const DashboardController = require('../controllers/DashboardController');
const bodyParser = require('body-parser');
const multer = require('multer');

var upload = multer({ 
    dest: '_files/',
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, '_files/')
        },
        filename: function (req, file, cb) {
          cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
        }
    })
});

var router = express.Router();

router.use(Auth.middleware.userIsLoggedIn);

//=============== Recruiters ===============

router.get('/api/recruiters/all', Auth.middleware.userIsAdmin, RecruitersController.listAll);

router.post('/api/recruiters/new', Auth.middleware.userIsAdmin, bodyParser.json(), RecruitersController.createNew);

router.delete('/api/recruiters/:username', Auth.middleware.userIsAdmin, RecruitersController.delete);

//=============== Candidates ===============

router.get('/api/candidates/all', Auth.middleware.userIsAdmin, CandidatesController.listAll);

router.delete('/api/candidates/:id', Auth.middleware.userIsAdmin, CandidatesController.delete);

//=============== Users ===============

router.post('/api/users/:username', upload.single('cvfile'), UsersController.updateProfile);

router.put('/api/users/:username/password', bodyParser.json(), UsersController.updatePassword);

//=============== Jobs ===============

router.post('/api/jobs/new', Auth.middleware.userIsRecruiter, bodyParser.json(), JobsController.createNew);

router.get('/api/jobs/list', Auth.middleware.userIsNotCandidate, JobsController.fetchAll);

router.put('/api/jobs/:id', Auth.middleware.userIsNotCandidate, bodyParser.json(), JobsController.updateJob);

router.delete('/api/jobs/:id', Auth.middleware.userIsNotCandidate, JobsController.deleteJob);

router.post('/api/jobs/ask', Auth.middleware.userIsCandidate, bodyParser.json(), JobsController.queryAvailable);

router.post('/api/jobs/:id/request', Auth.middleware.userIsCandidate, bodyParser.json(), JobsController.makeJobRequest);

//=============== Job Requests ===============

router.get('/api/jobrequests/list', Auth.middleware.userIsCandidate, CandidatesController.fetchRequests);

router.delete('/api/jobrequests/:id', Auth.middleware.userIsCandidate, CandidatesController.deleteRequest);

router.get('/api/jobrequests/listReceived', Auth.middleware.userIsRecruiter, RecruitersController.listReceived);

router.put('/api/jobrequests/:id/reject', Auth.middleware.userIsRecruiter, bodyParser.json(), RecruitersController.rejectJobRequest);

//=============== Notifications ===============

router.get('/api/notifications/list', UsersController.fetchNotifications);

router.post('/api/notifications/delete', bodyParser.json(), UsersController.deleteNotifications);

router.post('/api/notifications/:id/mark', bodyParser.json(), UsersController.markNotification);

router.post('/api/admin/notification/new', bodyParser.json(), UsersController.makeAdminNotification);

router.get('/api/admin/notifications/sent', UsersController.getAdminNotifications);

//================ Statistics ==================

router.get('/api/dashboard/statistics', DashboardController.getStatistics);

module.exports = router;