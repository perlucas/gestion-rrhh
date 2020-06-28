const Auth = require('../services/AuthServices');

const LoginController = {

    show : function (req, res) {
        var error = req.session.error || "";
        delete req.session.error;

        var credentials = {
            email: req.body.email || "",
            password: req.body.password || ""
        };
        
        res.render('login', {
            error,
            credentials,
            title: 'Ingresar'
        });
    },

    doLogin : function (req, res) {
    
        Auth.services.authenticateUser(req, req.body.email, req.body.password)
            .then(result => {
                if (! result) {
                    // redirect to login (if wrong pass or inexistant email/username)
                    req.session.error = "Credenciales erróneas, verifique su email y contraseña";
                    return LoginController.show(req, res);    
                }
                res.redirect('/dashboard');
            })
            .catch(err => console.log(err));
    },

    doLogout: function (req, res) {
        Auth.services.logout(req)
            .then(() => res.redirect('/login'))
            .catch(err => console.log(err));
    }

};

module.exports = LoginController;