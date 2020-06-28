const UserCredentials = require('../models/UserCredentials');
const notificationModels = require('../models/Notification');
const Auth = require('../services/AuthServices');
const NotificationResource = require('../resources/Notification');
const AdminNotificationResource = require('../resources/admin/AdminNotification');
const moment = require('moment');
const fs = require('fs');

var controller = {};

controller.showUpdateForm = function (req, res) {
    var id = req.params.id;

    UserCredentials.findOne({ user: id })
        .populate('user')
        .then(u => {
            res.render('edit-user', {
                title: 'Datos del usuario',
                isOwner: Auth.services.userCredentials.user._id
                    .toString()
                    .localeCompare(id) === 0,
                userData: u,
                isNotAdmin: ! u.isAdmin(),
                isCandidate: u.isCandidate()
            });
        })
        .catch(err => console.log(err));
};

controller.updateProfile = function (req, res) {
    var uname = req.params.username;
    req.body.location = JSON.parse(req.body.location);
    req.body.skills = req.body.skills.split(',') || [];
    
    if (uname !== Auth.services.userCredentials.username) {
        res.status(500).send('Acceso denegado');
    }
    else {
        var user = Auth.services.userCredentials.user;
        user.name = req.body.name;

        if ( !user.isAdmin() ) {
            user.birthdate = moment(req.body.birthdate, 'DD/MM/YYYY').toDate();
            user.profileDescription = req.body.description;
        }

        if (user.isCandidate()) {
            (
                {
                    skills: user.skills, 
                    location: { 
                        country: user.location.country,
                        state: user.location.state,
                        city: user.location.city
                    } 
                } = req.body
            );

            if (req.file) {
                console.log("Received: " + req.file.filename);
                if (user.cvfilename) {
                    // delete old cv
                    fs.unlink('_files/' + user.cvfilename, (err) => {
                        if (err) throw err;
                    });
                }
                user.cvfilename = req.file.filename;
            }
        }

        user.save()
            .then(updated => res.json({
                success: true,
                newfile: updated.cvfilename
            }))
            .catch(err => res.status(500).json(err))
    }
};

controller.updatePassword = function (req, res) {
    var currentCredentials = Auth.services.userCredentials;
    var error = false
    if (! currentCredentials.comparePassword(req.body.oldPassword) ) {
        error = 'Current password is wrong';
    }
    
    if (req.body.newPassword !== req.body.confirmation) {
        error = 'Current password is wrong'
    }

    if (! error) {
        currentCredentials.password = req.body.newPassword;
        currentCredentials.save()
            .then(saved => res.json({success: true}))
            .catch(err => res.status(500).json(err));
    }
    else {
        res.status(500).send(error);
    }
};

controller.showNotificationsList = function (req, res) {
    res.render('list-notifications', {
        title: 'Mis Notificaciones'
    });
};

controller.fetchNotifications = async function (req, res) {
  
    filters = {
        receiver: Auth.services.userCredentials._id
    };

    if (req.query.dashboard) {
        filters.isRead = false;
    }


    var notifications = await notificationModels.BaseNotification.
        find(filters).
        populate('receiver').
        sort({ timestamp: -1 });

    NotificationResource.convertManyToJson(notifications)
        .then(result => res.json(result))
        .catch(err => {
            console.error(err);
            res.status(500).json(err);
        });
};

controller.deleteNotifications = async function (req, res) {
    var ids = req.body.ids;

    if (ids.length > 0) {
        await notificationModels.BaseNotification.deleteMany({
            _id: { $in: ids },
            receiver: Auth.services.userCredentials._id
        });
    }

    res.json({success: true});
};

controller.markNotification = async function (req, res) {
    var notification = await notificationModels.BaseNotification.findOne({
        _id: req.params.id,
        receiver: Auth.services.userCredentials._id
    });

    if (notification) {
        notification.isRead = req.body.isRead;
        notification.save((err, nn) => {
            if (err) {
                console.log(err);
                res.status(500).json(err);
            } else {
                res.json({success: true});
            }
        });
    } else {
        res.status(500).json({
            success: false,
            msg: 'Notification not found'
        });
    }
};

controller.showNotifier = function (req, res) {

    UserCredentials.find({ _id: { $ne: Auth.services.userCredentials._id } })
        .populate('user')
        .then(credentials => {
            res.render('notifier', {
                title: 'Emitir notificaciones',
                users: credentials.map(cred => cred.user)
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).end('Error inesperado, regrese a la página anterior.');
        });
};

controller.makeAdminNotification = async function (req, res) {
    var data = req.body;

    var credentials = await UserCredentials.findOne({ user: data.user });

    notificationModels.AdminNotification.create({
        receiver: credentials._id,
        sender: Auth.services.getCurrentUser()._id,
        message: data.message
    })
        .then(nn => {
            res.json({ success: true });
        })
        .catch(err => {
            console.error(err);
            res.status(500).json(err);
        });
};

controller.getAdminNotifications = async function (req, res) {

    var adminNotifications = await notificationModels
        .AdminNotification
        .find({ sender: Auth.services.getCurrentUser()._id });
    
    var resources = Promise.all(
        adminNotifications.map(nn => AdminNotificationResource.fromNotificationModel(nn))
    );

    resources
        .then(docs => res.json(docs))
        .catch(err => {
            console.error(err);
            res.status(500).json(err);
        });
};

module.exports = controller;