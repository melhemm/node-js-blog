const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer')
const fs = require('fs')
const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file,cb) {
        cb(null, './public/images')
    },
    filename:(req, file,cb)=> {
        cb(null, file.fieldname +'-'+ Date.now() + path.extname(file.originalname));
    }
}); 

const upload = multer({
    storage: storage
}).single('image');

router.use(express.static('images'));

// Load User Model 
require('../models/User');
const User = mongoose.model('users');

router.use(bodyParser.urlencoded({
    extended: false
}));
router.use(bodyParser.json());


// user Login Route
router.get('/login', (req, res) => {
    res.render('users/login');
});

// Login Form Post 
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

// user Register Route
router.get('/register', (req, res) => {
    res.render('users/register');
});

// User Register Form Post 
router.post('/register', upload,(req, res) => {
    let errors = [];
    const imageFile = req.file.filename;
    if (req.body.password != req.body.password2) {
        errors.push({
            text: 'Password dont match'
        });
    }
    if (req.body.password.length < 4) {
        errors.push({
            text: 'Password must be at least 4 character'
        });
    }

    if (errors.length > 0) {
        res.render('users/register', {
            errors: errors,
            name: req.body.name,
            lastname: req.body.lastname,
            city: req.body.city,
            education: req.body.education,
            email: req.body.email,
            password: req.body.password,
            password2: req.body.password2,
            imagename: imageFile
        });
    } else {
        User.findOne({
            email: req.body.email
        }).then(user => {
            if (user) {
                req.flash('error_msg', 'Email alerady Registered');
                res.redirect('/users/register');
            } else {
                const newUser = new User({
                    name: req.body.name,
                    lastname: req.body.lastname,
                    city: req.body.city,
                    education: req.body.education,
                    email: req.body.email,
                    password: req.body.password,
                    imagename: imageFile
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser.save().then(user => {
                            req.flash('success_msg', 'You are now a member and you can login')
                            res.redirect('/users/login');
                        }).catch(err => {
                            console.log(err);
                            return
                        });
                    });
                });
            }
        });
    }
});


// Logout User Function 
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are Logout');
    res.redirect('/users/login')
});

module.exports = router;

