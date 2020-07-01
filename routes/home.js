const express = require('express');

var router = express.Router();

router.get('/', function (req, res) {
   res.redirect('/home');
});


router.get('/home', function (req, res) {
    res.render('home', {
        title: 'Inicio - Gestión RRHH IT',
        leyout: 'guest/main'
    });
});

module.exports = router;