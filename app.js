const express = require('express');
// const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const seesion = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const fs = require('fs');
const app = express();

// Load routes
const posts = require('./routes/posts');
const users = require('./routes/users');
const index = require('./routes/index');
const mongoose = require('./database');

// Static Folder
app.use(express.static('public'));
app.use(express.static('images'));
app.use(express.static('uploads'));

// Load User and post Model 
require('./models/User');
require('./models/Posts');


// Passport Config 
require('./config/passport')(passport);


// Handlebars Helpers 
const {
    formatDate,
    select,
    editIcon
} = require('./helpers/hbs');


// Map Global promise -get rid of warning
mongoose.Promise = global.Promise;

// Connect to mongoose


// Handlebars Middleware
app.engine('handlebars', exphbs({
    helpers: {
        formatDate: formatDate,
        select: select,
        editIcon: editIcon
    },
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Body Parser Middleware 
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());


// Method-Override Middleware
app.use(methodOverride('_method'));

// Express Session Middleware
app.use(seesion({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Middlewar
app.use(flash());

// Global varibales
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Routes 
app.use('/posts', posts);
app.use('/users', users);
app.use('/', index);

// 404
app.get('*', (req, res) => {
    res.redirect('/')
})

// Port 
const port = 8080;

app.listen(process.env.PORT || PORT , port, () => {
    console.log(`Server Started on Port ${port}`);
});