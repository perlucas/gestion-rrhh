const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Handlebars = require('handlebars');
const exphbs  = require('express-handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const session = require('express-session');
const Auth = require('./services/AuthServices');
require('dotenv').config();

// ================ mongodb connection ============

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})
.then(() => console.log("MongoDB connection established successfully!"))
.catch(err => console.log(err));

// ================= middlewares & configuration =================== //

require('./init');

var hbs = exphbs({

    handlebars: allowInsecurePrototypeAccess(Handlebars),

    helpers: {
        admin: function (options) {
            if ( Auth.services.isAdmin() ) {
                return options.fn(this);
            }
        },

        recruiter: function (options) {
            if ( Auth.services.userCredentials.isRecruiter() ) {
                return options.fn(this);
            }
        },

        candidate: function (options) {
            if (Auth.services.userCredentials.isCandidate()) {
                return options.fn(this);
            }
        },

        currentUserId: function () {
            return Auth.services.getCurrentUser()._id;
        },

        currentUserName: function () {
            return Auth.services.getCurrentUser().name;
        }
    },
})

const app = express();

app.use(session({ 
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: true
}));

app.engine('handlebars', hbs);

app.set('view engine', 'handlebars');

app.use(morgan('tiny'));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static('public'));

app.use(Auth.services.initFromRequest);

// ================= routes ===================== //

app.use(require('./routes/login'));

app.use(require('./routes/dashboard'));

app.use(require('./routes/recruiters'));

app.use(require('./routes/candidates'));

app.use(require('./routes/users'));

app.use(require('./routes/jobs'));

app.use(require('./routes/api'));

app.use(require('./routes/downloads'));

app.listen(80);