const UserCredentials = require('../models/UserCredentials');

const Middleware = {

    userIsLoggedIn : function (req, res, next) {
        if (req.session.currentUserCredentials) {
            next();
        } else {
            res.status(401);
            res.render('error-401', {
                title: 'Acceso denegado',
                message: 'Debe ingresar para ver esta sección',
                returnPage: '/login',
                layout: 'guest/main'
            });
        }
    },

    userIsAdmin: function (req, res, next) {
        if (Services.userCredentials.isAdmin()) {
            next();
        } else {
            res.status(401);
            res.render('error-401', {
                title: 'Acceso denegado',
                message: 'Debe ser administrador para ver esta sección',
                returnPage: '/dashboard',
                layout: 'guest/main'
            });
        }
    },

    userIsRecruiter: function (req, res, next) {
        if (Services.userCredentials.isRecruiter()) {
            next();
        } else {
            res.status(401);
            res.render('error-401', {
                title: 'Acceso denegado',
                message: 'Debe ser un reclutador para ver esta sección',
                returnPage: '/dashboard',
                layout: 'guest/main'
            });
        }
    },

    userIsCandidate: function (req, res, next) {
        if (Services.userCredentials.isCandidate()) {
            next();
        } else {
            res.status(401);
            res.render('error-401', {
                title: 'Acceso denegado',
                message: 'Debe ser un candidato para ver esta sección',
                returnPage: '/dashboard',
                layout: 'guest/main'
            });
        }
    },

    userIsNotCandidate: function (req, res, next) {
        if (
            Services.userCredentials.isRecruiter() ||
            Services.userCredentials.isAdmin()
        ) {
            next();
        } else {
            res.status(401);
            res.render('error-401', {
                title: 'Acceso denegado',
                message: 'No tiene los permisos necesarios para acceder a esta sección',
                returnPage: '/dashboard',
                layout: 'guest/main'
            });
        }
    }

};

class Services {
    
    static userCredentials = false;

    static async initFromRequest (req, res, next) {

        if ( req.session.currentUserCredentials) {
            req.app.locals.layout = 'user/main';
            UserCredentials
                .findById(req.session.currentUserCredentials._id)
                .populate('user')
                .then(credentials => {
                    Services.userCredentials = credentials;
                    next();
                });
            
        } 
        else {
            Services.userCredentials = false;
            req.app.locals.layout = 'guest/main';
            next();
        }
    }

    static async authenticateUser (req, emailOrUsername, pass) {
        try {
            const credentials = await UserCredentials.findOne({
                password: UserCredentials.hashPassword(pass),
                $or: [
                    { username: emailOrUsername },
                    { email: emailOrUsername }
                ]
            })
                .populate('user');
            
            if (credentials) {
                req.session.currentUserCredentials = credentials;
                Services.userCredentials = credentials;
                return true;
            }
            return false;
        } 
        catch (err) { 
            console.log(err); 
            return false;
        }
    }

    static async logout (req) {
        Services.userCredentials = false;
        return req.session.destroy();
    }

    static isAdmin () {
        if (Services.userCredentials) {
            return Services.userCredentials.isAdmin();
        }
        return false;
    }

    static getCurrentUser () {
        if (Services.userCredentials) {
            return Services.userCredentials.user;
        }
        throw 'Current user not found: not login has been done';
    }

};


module.exports = {
    middleware: Middleware,
    services: Services
};