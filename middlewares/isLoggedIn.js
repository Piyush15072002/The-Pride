
const jwt = require('jsonwebtoken');

const cookie = require('cookie-parser');



const isLoggedIn = async (req, res, next) => {

    const token = req.cookies['access-token']

    if (token) {
        const validToken = jwt.verify(token, process.env.JWT_SECRET);
        if (validToken) {
            res.user = validToken._id
            return next();
        }
        else {
            console.log('Token expired')
            return res.redirect('/user/login');
        }
    } else {
        console.log('Token expired')
        return res.redirect('/user/login');
    }

};

module.exports = isLoggedIn;