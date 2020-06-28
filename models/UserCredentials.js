const Admin = require('./Admin');
const Candidate = require('./Candidate');
const Recruiter = require('./Recruiter');
const mongoose = require('mongoose');
const crypto = require('crypto');

var UserCredentialsSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: [true, 'Debe indicarse un username'],
        unique: true,
        minlength: [5, 'El username debe tener al menos 5 caracteres'],
        match: [/^[A-Za-z][A-Za-z0-9_]+$/, 'El username no puede contener caracteres especiales y debe comenzar con una letra'] 
    },
    email: {
        type: String,
        required: [true, 'Debe indicarse un email'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'El email ingresado no es válido']
    },
    password: {
        type: String,
        required: [true, 'Debe indicarse una contraseña'],
        minlength: [5, 'La contraseña debe contener al menos 5 caracteres']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'userType'
    },
    userType: {
        type: String,
        required: true,
        enum: [Candidate.modelName, Recruiter.modelName, Admin.modelName]
    }
});

const hashFn = function (pass) {
    const secret = '2a65d4a824516dsasd54235d16';
    const hash = crypto.createHmac('sha256', secret)
        .update(pass)
        .digest('hex');
    return hash;
};

// static method por hashing passwords
UserCredentialsSchema.statics.hashPassword = hashFn;

// compare a raw password with the credentials instance's password
UserCredentialsSchema.methods.comparePassword = function (passwordToCompare) {
    var hash = hashFn(passwordToCompare);
    return (hash === this.password);
};

UserCredentialsSchema.methods.isAdmin = function () { return this.userType === Admin.modelName; };

UserCredentialsSchema.methods.isRecruiter = function () { return this.userType === Recruiter.modelName; };

UserCredentialsSchema.methods.isCandidate = function () { return this.userType === Candidate.modelName; };

UserCredentialsSchema.statics.createForUser = function (data, u) {
    var credentials = new this(data);
    credentials.user = u._id;
    credentials.userType = u.constructor.modelName;
    return credentials;
};


// hook for hashing created passwords
UserCredentialsSchema.pre('save', function (next) {
    this.password = hashFn(this.password);
    next();
});

module.exports = mongoose.model('UserCredentials', UserCredentialsSchema);