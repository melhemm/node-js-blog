const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Posts = mongoose.model('posts');
const {ensureAuthenticated} = require('../helpers/auth');

router.get('/', ensureAuthenticated,(req, res) => {
    if(req.user) {
        Posts.find({user:req.user.id}).then(posts =>{
            res.render('index/profile', {
                posts: posts
            })  
        })    
    } else {
        res.render('index/welcome')
    }
});

router.get('/profile', ensureAuthenticated,(req, res) => {
    Posts.find({user:req.user.id})
    .then(posts =>{
        res.render('index/profile', {
          posts: posts
        });
    })
});

module.exports = router;