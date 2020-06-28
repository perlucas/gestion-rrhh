const moment = require('moment');

module.exports.fromJobRequest = function (jobrequest) {

    return {
        requestId: jobrequest._id,
        jobId: jobrequest.job._id,
        jobTitle: jobrequest.job.title,
        requestDate: moment(jobrequest.timestamp).format('DD/MM/YYYY HH:mm:ss'),
        message: jobrequest.message,
        rejected: jobrequest.rejected
    };
};
