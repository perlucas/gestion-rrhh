const mongoose = require('mongoose');
const moment = require('moment');

var BaseNotificationSchema = new mongoose.Schema({
    receiver: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'UserCredentials',
        required: true
    },

    isRead: {
        type: mongoose.SchemaTypes.Boolean,
        default: false
    },

    timestamp: {
        type: mongoose.SchemaTypes.Date,
        default: function () {
            return moment().toDate(); // current time
        }
    }
});

BaseNotificationSchema.methods.markAsRead = function () {
    this.isRead = true;
};

BaseNotificationSchema.methods.markAsUnread = function () {
    this.isRead = false;
};


// Base notification model & Schema
const BaseNotification = mongoose.model('BaseNotification', BaseNotificationSchema);

module.exports.BaseNotification = BaseNotification;

// New user notification model & Schema
module.exports.NewUserNotification = BaseNotification.discriminator('NewUserNotification', new mongoose.Schema({
    user: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        refPath: 'userType'
    },

    userType: {
        type: String,
        required: true,
        default: 'Candidate',
        enum: ['Candidate', 'Recruiter']
    }
}));

// Welcome notification model & Schema
module.exports.WelcomeNotification = BaseNotification.discriminator('WelcomeNotification', new mongoose.Schema({}));

// Request rejected notification model & schema
module.exports.RequestRejectedNotification = BaseNotification.discriminator(
    'RequestRejectedNotification',
    new mongoose.Schema({

        request: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'JobRequest',
            required: true
        },

        message: mongoose.SchemaTypes.String

    })
);

// Job state changed notification model & schema
module.exports.JobStateChangedNotification = BaseNotification.discriminator(
    'JobStateChangedNotification',
    new mongoose.Schema({
        job: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'JobOffer',
            required: true
        },
        
        fulfilled: mongoose.SchemaTypes.Boolean
    })
);

// Job deleted notification model & schema
module.exports.JobDeletedNotification = BaseNotification.discriminator(
    'JobDeletedNotification',
    new mongoose.Schema({
        jobTitle: {
            type: mongoose.SchemaTypes.String,
            default: ''
        }
    })
);

// Admin notification model & schema
module.exports.AdminNotification = BaseNotification.discriminator(
    'AdminNotification',
    new mongoose.Schema({
        message: {
            type: mongoose.SchemaTypes.String,
            required: true,
            minlength: 2
        },

        sender: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Admin',
            required: true
        }
    })
);