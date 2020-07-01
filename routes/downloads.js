const express = require('express');

const Auth = require('../services/AuthServices');

var router = express.Router();

router.get('/downloads/cv', Auth.middleware.userIsLoggedIn, function (req, res) {
    var filename = "_files/" + req.query.file;
    res.download(filename);
});

module.exports = router;