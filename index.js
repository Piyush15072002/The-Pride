if (process.env.NODE_ENV !== 'production') {  // if we are not in production mode means we are in development mode then
    require('dotenv').config();
}

// Importing libraries and packages
const express = require('express');

const app = express();

const path = require('path');

const ejsMate = require('ejs-mate'); // lets us create partials, boilerplate etc and add css in ejs files

const mongoose = require('mongoose');

const session = require('express-session');

const jwt = require('jsonwebtoken');

const User = require('./model/User');
const Guide = require('./model/Guide');
const Site = require('./model/Sites');

const cookieparser = require('cookie-parser');

// Router routes importing

const userRoutes = require('./routes/users');
const guideRoutes = require('./routes/guides');
const siteRoutes = require('./routes/sites');


app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));


// Database Connnection
const dbUrl = process.env.mongo_url || 'mongodb://localhost:27017/sunhacks';

mongoose.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection
db.on('error', () => {
    console.error.bind(console, "Connection Error :-<")
})
db.once('open', () => {
    console.log("Connected to Database")
})

app.use(cookieparser());
app.use(express.json());


// middleware to create a local user
app.use(async (req, res, next) => {

    const token = req.cookies['access-token']

    if (token) {

        const payload = jwt.decode(token, process.env.JWT_SECRET);

        const userId = payload.id



        const user = await User.findById(userId);
        const guide = await Guide.findById(userId);

        if (user) {

            res.locals.currentUser = user;


            next();
        }
        else if (guide) {
            res.locals.currentUser = guide;

            next();
        }
        else {
            res.locals.currentUser = false
            next();
        }

    }
    else {
        res.locals.currentUser = false
        next();
    }


});



// Router Routes handling
app.use('/user', userRoutes);
app.use('/guide', guideRoutes);
app.use('/sites', siteRoutes);



// General Routes

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/aboutus', (req, res) => {
    res.render('aboutus.ejs');
});

app.get('/contactus', (req, res) => {
    res.render('contact.ejs');
});
app.get('/vocalforlocal', (req, res) => {
    res.render('vocalforlocal.ejs');
});

app.get('/infohub', (req, res) => {
    res.render('infohub.ejs');
});







// For unknown routes

app.all('*', (req, res) => {
    res.send("PAGE NOT FOUND 404 :-(");
})


// PORT

const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Listening at Port ${PORT}`)
})