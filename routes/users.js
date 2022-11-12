const express = require('express')

const router = express.Router();

const User = require('../model/User');

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const crypto = require('crypto');

const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

const cookie = require('cookie-parser');


const isVerified = require('../middlewares/isVerified');


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

// activating account

router.get('/activateaccount', async (req, res) => {
    try {
        const token = req.query.token

        const user = await User.findOne({ emailToken: token })


        console.log(user)

        if (user) {

            user.emailToken = null;

            // Verifing the user
            user.isVerified = true;

            await user.save();

            res.redirect('/user/login')

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


// Login 


router.get('/login', (req, res) => {
    res.render('login.ejs')
});


router.post('/login', isVerified, async (req, res) => {

    try {

        const { email, password } = req.body;

        const findUser = await User.findOne({ email: email });

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
                res.redirect('/user/login');
            }

        }
        else {
            res.redirect('/user/login');
        }


    }
    catch (err) {
        console.log(err);
    }

});


// General user Registration

router.get('/register', (req, res) => {
    res.render('register.ejs')
});


router.post('/register', async (req, res) => {



    try {

        const { username, email, password, number } = req.body;


        const existingUser = await User.findOne({ email: email })

        if (!existingUser) {

            const user = new User({
                username,
                email,
                password,
                number,
                emailToken: crypto.randomBytes(64).toString('hex'),
                isVerified: false,
            });

            console.log(req.body);
            console.log(user);

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
            <h3>Thanks for Registering on our site</h3>
            <p>Need detailed tour of your favourite heritage site online?</p>
            <p>Need a guide to help your offline tour?</p>
            <p>You do not have to worry! We are here for you. Our team will guide to the best and help you with your learning about your favorite monument while you enjoy the best moment of your life! Join us.</p>
            <p>All you need to do now is to activate your account and continue using our services</p>
            <a href="http://${req.headers.host}/user/activateaccount?token=${user.emailToken}">Activate your account</a>
            <br>
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

            const message = "We have sent a mail to your email account! Please activate your account using the link given in the mail, Check Spam folder if you cannot find the mail :-)"
            res.render('message.ejs', { message: message });

        } else {
            const message = "User is already there with entered email";
            res.render('message.ejs', { message: message })

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