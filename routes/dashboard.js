const express = require('express');
const Auth = require('../services/AuthServices');

var router = express.Router();

router.get('/dashboard', Auth.middleware.userIsLoggedIn, function (req, res) {
    res.render('dashboard', {
        title: 'Dashboard'
    });
});

module.exports = router;