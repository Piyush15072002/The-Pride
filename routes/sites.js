const express = require('express');

const router = express.Router();

const User = require('../model/User');
const Guide = require('../model/Guide');
const Site = require('../model/Sites');

const isVerified = require('../middlewares/isVerified');
const isLoggedIn = require('../middlewares/isLoggedIn');


// to visit all sites
router.get('/', async (req, res) => {

    const sites = await Site.find({});

    res.render('sites.ejs', { sites: sites });
});

// to add a new site
router.get('/new', isLoggedIn, async (req, res) => {
    res.render('newSite.ejs')
})

router.post('/new', isLoggedIn, async (req, res) => {

    try {

        const { sitename, built, description, city, image } = req.body

        const site = new Site({
            sitename, built, description, city, image
        })

        await site.save();

        console.log("Site saved successfully");

        return res.redirect("/sites");


    } catch (e) {
        console.log(e.message);
        res.send("Error!")
    }

});


// explore page

router.get('/:id', async (req, res) => {

    const { id } = req.params;

    const site = await Site.findById(id);

    console.log(site);

    res.render("explore.ejs", { site })


})



module.exports = router;

