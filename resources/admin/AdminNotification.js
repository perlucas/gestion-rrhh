const UserCredentials = require('../../models/UserCredentials');

module.exports.fromNotificationModel = async function (notification) {

    var data = {
        message: notification.message,
        timestamp: notification.timestamp
    };

    if (notification.populated('receiver')) {
        var credentials = notification.receiver;
    } else {
        var credentials = await UserCredentials.findOne({ _id: notification.receiver }).populate('user');
    }

    if (! credentials.populated('user')) {
        await credentials.populate('user').execPopulate();
    }

    data.user = {
        id: credentials.user.id,
        name: credentials.user.name
    };

    return data;
};