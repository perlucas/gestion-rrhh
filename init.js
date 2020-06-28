const Admin = require('./models/Admin');
const Recruiter = require('./models/Recruiter');
const Candidate = require('./models/Candidate');
const UserCredentials = require('./models/UserCredentials');
const moment = require('moment');

// ==========================================================
// ======== create default admin/admin user if not exists
// ==========================================================

if ( process.env.CREATE_DEFAULT_ADMIN ) {

    Admin.find({})
        .then(users => {
            if (users.length === 0) {
                Admin.create({ name: 'admin' })
                    .then(defaultAdmin => {
                        UserCredentials.create({
                            username: 'admin',
                            email: 'admin@admin.com',
                            password: 'admin',
                            user: defaultAdmin._id,
                            userType: defaultAdmin.constructor.modelName
                        })
                            .then(creds => console.log("Admin user has been created"))
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
}

// ==========================================================
// ======== create default recruiter user if not exists
// ==========================================================

if ( process.env.CREATE_DEFAULT_RECRUITER ) {

    Recruiter.find({})
        .then(users => {
            if (users.length === 0) {
                Recruiter.create({})
                    .then(user => {
                        UserCredentials.create({
                            username: 'recruiter',
                            email: 'recruiter@recruiter.com',
                            password: 'recruiter',
                            user: user._id,
                            userType: user.constructor.modelName
                        })
                            .then((cc) => console.log('Default recruiter has been created'))
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
}

// ==========================================================
// ======== create default candidate user if not exists
// ==========================================================

if ( process.env.CREATE_DEFAULT_CANDIDATE ) {

    Candidate.find({})
        .then(users => {
            if (users.length === 0) {
                Candidate.create({
                    name: 'default',
                    birthdate: moment('1995-10-08').toDate(),
                    location: {
                        country: 'Argentina',
                        state: 'La Pampa',
                        city: 'General Pico'
                    },
                    skills: ['PHP', 'Java', 'Javascript']
                })
                    .then(user => {
                        UserCredentials.create({
                            username: 'candidate',
                            email: 'candidate@candidate.com',
                            password: 'candidate',
                            user: user._id,
                            userType: user.constructor.modelName
                        })
                            .then((cc) => console.log('Default candidate has been created'))
                            .catch(err => console.log(err));
                    })
                    .catch(err => console.log(err));
            }
        })
        .catch(err => console.log(err));
}