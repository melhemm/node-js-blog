const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer')
const fs = require('fs')
const router = express.Router();
const {
    ensureAuthenticated
} = require('../helpers/auth');


const storage = multer.diskStorage({
    destination: function(req, file,cb) {
        cb(null, './public/uploads')
    },
    filename:(req, file,cb)=> {
        cb(null, file.fieldname +'-'+ Date.now() + path.extname(file.originalname));
    }
}); 

const upload = multer({
    storage: storage
}).single('image');

// Load Post Model 
require('../models/Posts');
const Posts = mongoose.model('posts');

// Posts Index Page
router.get('/', ensureAuthenticated,(req, res) => {
    Posts.find({
            status: 'public'
        })
        .populate('user')
        // Posts.find({user: req.user.id})
        .sort({
            date: 'desc'
        })
        .then(posts => {
            res.render('posts/index', {
                posts: posts
            });
        });
});

// show posts from a user

router.get('/user/:userId', (req, res) => {
    Posts.find({
            user: req.params.userId,
            status: 'public'
        })
        .populate('user').then(posts => {
            res.render('posts/index', {
                posts: posts
            });
        })
});

// Logged in user posts 
router.get('/my', ensureAuthenticated,(req, res) => {
    Posts.find({
            user: req.user.id
        })
        .populate('user').then(posts => {
            res.render('posts/index', {
                posts: posts
            });
        })
});

// Show Single Post 
router.get('/show/:id', (req, res) => {
    Posts.findOne({
            _id: req.params.id
        })
        .populate('user')
        .populate('comments.commentUser')
        .then(posts => {
            if (posts.status == 'public') {
                res.render('posts/show', {
                    posts: posts
                });
            } else {
                if (req.user) {
                    if (req.user.id == posts.user._id) {
                        res.render('posts/show', {
                            posts: posts
                        });
                    } else {
                        res.redirect('/posts');
                    }
                } else {
                    res.redirect('/posts')
                }
            }
        });
});

// Add Posts Form 
router.get('/add', ensureAuthenticated, (req, res) => {
    res.render('posts/add')
});

// Process From 
router.post('/', upload, ensureAuthenticated,(req, res) => {
    let errors = [];
    let allowComments;
    const imageFile = req.file.filename;
    if (req.body.allowComments) {
        allowComments = true;
    } else {
        allowComments = false;
    }

    if (!req.body.details) {
        errors.push({
            text: 'Please add some details'
        });
    }
    if (errors.length > 0) {
        res.render('posts/add', {
            errors: errors,
            details: req.body.details
        });
    } else {
        const newUser = {
            details: req.body.details,
            status: req.body.status,
            allowComments: allowComments,
            image: imageFile,
            user: req.user.id,

        }
        // Create Post
        new Posts(newUser).save().then(posts => {
            req.flash('success_msg', 'Published');
            res.redirect(`/posts/show/${posts.id}`)
        });
    }
});


// Edit Posts Form 
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Posts.findOne({
        _id: req.params.id
    }).then(posts => {
        if (posts.user != req.user.id) {
            req.flash('error_msg', 'You Have To login');
            res.redirect('/posts')
        } else {
            res.render('posts/edit', {
                posts: posts
            });
        }
    })
});


// Edit form process
router.put('/:id', ensureAuthenticated,(req, res) => {
    Posts.findOne({
            _id: req.params.id
        })
        .then(posts => {
            let allowComments;

            if (req.body.allowComments) {
                allowComments = true;
            } else {
                allowComments = false;
            }
            posts.details = req.body.details;
            posts.status = req.body.status;
            posts.allowComments = allowComments;

            posts.save().then(posts => {
                req.flash('success_msg', 'Post updated');
                res.redirect('/profile')
            });
        });
});

// Delete Posts
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Posts.deleteOne({
        _id: req.params.id
    }).then(() => {
        req.flash('success_msg', 'Post removed');
        res.redirect('/posts')
    });
});

// Add comment 
router.post('/comment/:id', ensureAuthenticated,(req, res) => {
    Posts.findOne({
            _id: req.params.id
        })
        .then(posts => {
            const newComment = {
                commentBody: req.body.commentBody,
                commentUser: req.user.id
            }

            // Push to comments array
            posts.comments.unshift(newComment)
            posts.save().then(posts => {
                res.redirect(`/posts/show/${posts.id}`)
                console.log(newComment)
            })
        })
})

module.exports = router;