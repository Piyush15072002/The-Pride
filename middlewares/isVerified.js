const User = require('../model/User');
const Guide = require('../model/Guide');

const jwt = require('jsonwebtoken');

const cookie = require('cookie-parser');

const isVerified = async (req, res, next) => {
    try {

        console.log(req.body)

        const user = await User.findOne({ email: req.body.email })
        const guide = await Guide.findOne({ email: req.body.email })

        console.log(user)
        console.log(guide)

        if (user) {
            if (user.isVerified === true) {
                return next();
            }

            if (user.isVerified === false) {
                console.log("Please activate your account using the email sent to you!")
                const message = "Please activate your Account using the mail sent to your registered Email, then Login again! "
                return res.render('message.ejs', { message: message });
            }


        }
        else if (guide) {
            if (guide.isVerified === true) {
                return next();
            }

            if (guide.isVerified === false) {
                console.log("Please activate your account using the email sent to you!")
                const message = "Please activate your Account using the mail sent to your registered Email, then Login again! "
                return res.render('message.ejs', { message: message });
            }

        } else {
            const message = "Your email is not registered, You need to Register first";
            return res.render('message.ejs', { message: message });

        }


    }
    catch (err) {
        console.log(err)
    }
}



module.exports = isVerified;