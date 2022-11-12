const express = require('express')

const router = express.Router();

const Guide = require('../model/Guide');

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

const cookie = require('cookie-parser');

const isVerified = require('../middlewares/isVerified');
const isLoggedIn = require('../middlewares/isLoggedIn');

// function to create a JWT token

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
};

// Email sender details

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.email_username,
        pass: process.env.email_password

    },
    tls: {
        rejectUnauthorized: false,
    }
})


// guides
router.get('/', async (req, res) => {

    const guides = await Guide.find();

    res.render('guides.ejs', { guides: guides });
})

router.get('/connect/:id', isLoggedIn, async (req, res) => {

    try {

        const { id } = req.params;

        const guide = await Guide.findById(id);

        console.log(guide)

        res.render("guideprofile.ejs", { guide: guide });


    } catch (e) {
        console.log(e.message);
    }


});


// activating account

router.get('/activateaccount', async (req, res) => {
    try {
        const token = req.query.token

        const user = await Guide.findOne({ emailToken: token })


        console.log(user)

        if (user) {

            user.emailToken = null;

            // Verifing the user
            user.isVerified = true;

            await user.save();

            res.redirect('/guide/login')

        }
        else {
            res.redirect('/');
        }
    }
    catch (err) {
        console.log(err);
        res.send('An Error Occurred')
    }
});

router.get('/login', (req, res) => {
    res.render('login.ejs')
});


router.post('/login', isVerified, async (req, res) => {

    try {

        const { email, password } = req.body;

        const findUser = await Guide.findOne({ email: email });

        if (findUser) {

            const isUser = await bcrypt.compare(password, findUser.password);

            if (isUser) {

                // after user have been authenticated, we need to save the login details using token
                const token = createToken(findUser._id);

                // Storing the created user in cookie
                res.cookie('access-token', token)

                res.redirect('/');
            }
            else {
                res.redirect('/guide/login');
            }

        }
        else {
            res.redirect('/guide/login');
        }


    }
    catch (err) {
        console.log(err);
    }

});




// Partner Registration

router.get('/register', (req, res) => {
    res.render('partnerRegister.ejs')
});

router.post('/register', async (req, res) => {

    try {

        const { username, email, password, number, fees, place } = req.body;

        const existingUser = await Guide.findOne({ email: email })
        if (!existingUser) {

            const user = new Guide({
                username,
                email,
                password,
                fees,
                place,
                number,
                emailToken: crypto.randomBytes(64).toString('hex'),
                isVerified: false,
            });

            const salt = await bcrypt.genSalt(10)

            const hashedPassword = await bcrypt.hash(user.password, salt)

            user.password = hashedPassword

            const newuser = await user.save();


            // Send verification mail to the user
            let mailOptions = {
                from: ' "Activate your account" <songoku150702@gmail.com> ',
                to: user.email,
                subject: 'ThePride - Activate your account',
                html: `<h1>Hi ${user.username}!</h1>
            <h3>Thanks for Partnering with us, we are really happy to get your support</h3>
            <p>With us, you will be able to gain popularity, increase your work profit, expand your audience, and be in contact with us and our customers</p>
            <p>We are dedicated to help you anytime you need us by providing you with the best services and best customers</p>
            <p>All you need to do now is to activate your account and become our partner :-)</p>
            <a href="http://${req.headers.host}/guide/activateaccount?token=${user.emailToken}">Activate your account</a>
            <p>PS- Before verifying please check your details below for future contact</p>
            <p>Username : ${user.username}</p>
            <p>Phone number : ${user.number}</p>
            <br><br><br>
            <p><b>Warm Regards,</b><p>
            <p><b>Team ThePride</b></p>`
            }

            // sending mail
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error)
                    const message = "Sorry an error occurred at server :-("
                    return res.render('message.ejs', { message: message });
                }
                else {
                    console.log('An account activation mail has been sent to your email')

                }
            })

            const message = "We have sent a mail to your email account! Please activate your account using the link given in the mail :-)"
            res.render('message.ejs', { message: message });

        } else {
            const message = "This email is already in registered as our partner, Please use another!"
            res.render('message.ejs', { message: message });
        }

    } catch (err) {
        console.log(err);
    }

});


router.post('/logout', (req, res) => {
    res.cookie('access-token', "", { maxAge: 1 })
    res.redirect('/')
});


module.exports = router;