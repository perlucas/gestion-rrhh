const mongoose = require('mongoose');

var AdminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

AdminSchema.methods.isAdmin = function () { return true; };

AdminSchema.methods.isRecruiter = function () { return false; };

AdminSchema.methods.isCandidate = function () { return false; };

module.exports = mongoose.model('Admin', AdminSchema);

