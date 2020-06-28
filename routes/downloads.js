const express = require('express');
const Auth = require('../services/AuthServices');

var router = express.Router();

router.use(Auth.middleware.userIsLoggedIn);

router.get('/downloads/cv', function (req, res) {
    var filename = "_files/" + req.query.file;
    res.download(filename);
});

module.exports = router;