const express = require('express');
const controller = require('../controllers/LoginController');

var router = express.Router();

router.get('/login', controller.show);

router.post('/login', controller.doLogin);

router.get('/logout', controller.doLogout);

module.exports = router;