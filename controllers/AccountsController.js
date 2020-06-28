const Candidate = require('../models/Candidate');
const UserCredentials = require('../models/UserCredentials');
const NotificationServices = require('../services/Notifications');
const LoginController = require('../controllers/LoginController');
const moment = require('moment');

const AccountsController = {

    showRegisterForm: function (req, res) {
        var dataForTemplate = {
            errors: req.session.error,
            flashed: req.session.flashed,
            title: 'Registro de Candidato'
        };

        delete req.session.error;
        delete req.session.flashed;

        res.render('register', dataForTemplate);
    },


    registerUser: async function (req, res) {


        const feedbackError = function (req, res, err) {
            req.session.error = err.errors;
            req.session.flashed = req.body;
            res.redirect('/register');
        };

        if (req.body.password !== req.body.passwordConfirmation) {
            errors = { errors: { password: { message: 'Las contraseñas no coinciden' } } };
            return feedbackError(req, res, errors);
        }

        try {
            var candidate = await Candidate.create({
                name: req.body.fullname,
                birthdate: moment(req.body.birthdate, 'DD/MM/YYYY'),
                profileDescription: req.body.profileDescription,
                skills: req.body.skills,
                location: {
                    country: req.body.country,
                    state: req.body.state,
                    city: req.body.city,
                }
            });

            var credentials = await UserCredentials.createForUser({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password
            }, candidate);
            
            await credentials.save();

            await NotificationServices.notifyNewUser(credentials._id);

            LoginController.doLogin(req, res);
        }
        catch (err) {
            if (candidate) {
                await Candidate.findOneAndDelete({ _id: credentials.user })
            }
            feedbackError(req, res, err);
        }
    }


};

module.exports = AccountsController;